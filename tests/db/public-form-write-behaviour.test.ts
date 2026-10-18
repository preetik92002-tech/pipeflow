import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Behaviour of the "server-only form writes" migration and its rollback, using the real roles' semantics:
// the tables carry the exact policies captured from production, grants mirror Supabase's defaults, and every
// statement runs as anon / authenticated / service_role through SET ROLE. No network, no production access.
const read = (...p: string[]) => readFileSync(path.join(__dirname, '../../supabase', ...p), 'utf8')
const MIGRATION = read('migrations', '20261014000000_server_only_public_form_writes.sql')
const ROLLBACK = read('rollbacks', '20261014000000_server_only_public_form_writes.rollback.sql')

const uuid = () => crypto.randomUUID()
const LEAD = (status = 'new') => `INSERT INTO public.leads (status, assigned_to, lead_id) VALUES ('${status}', NULL, 'LD-${uuid()}')`
const BOOKING = () => `INSERT INTO public.bookings (status, lead_id, booking_id) VALUES ('requested', NULL, 'BK-${uuid()}')`
const PRO = () => `INSERT INTO public.pro_applications (status, notes, document_url, application_id) VALUES ('new', NULL, NULL, 'PA-${uuid()}')`

let db: PGlite
/** Runs one statement as the given role, always returning to the owner afterwards. */
async function as(role: 'anon' | 'authenticated' | 'service_role', sql: string) {
  await db.exec(`SET ROLE ${role}`)
  try {
    return await db.query(sql)
  } finally {
    await db.exec('RESET ROLE')
  }
}
const count = async (table: string) => Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM public.${table}`)).rows[0].n)

beforeAll(async () => {
  db = new PGlite()
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    -- Same as production: is_admin() reads profiles, which has no rows, so it is false for everyone.
    CREATE TABLE public.profiles (id uuid PRIMARY KEY, role text);
    CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') $$;
    CREATE TABLE public.leads (id serial PRIMARY KEY, status text, assigned_to uuid, lead_id text);
    CREATE TABLE public.bookings (id serial PRIMARY KEY, status text, lead_id uuid, booking_id text);
    CREATE TABLE public.pro_applications (id serial PRIMARY KEY, status text, notes text, document_url text, application_id text);
    CREATE TABLE public.faqs (id serial PRIMARY KEY, question text, active boolean);
    INSERT INTO public.faqs (question, active) VALUES ('shown', true), ('hidden', false);
    -- Supabase's default privileges: every API role gets everything on new public tables.
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY; ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.pro_applications ENABLE ROW LEVEL SECURITY; ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Admin manage leads" ON public.leads FOR ALL USING (public.is_admin());
    CREATE POLICY "Admin manage bookings" ON public.bookings FOR ALL USING (public.is_admin());
    CREATE POLICY "Admin manage pro applications" ON public.pro_applications FOR ALL USING (public.is_admin());
    CREATE POLICY "Public read active faqs" ON public.faqs FOR SELECT USING (active = true);
    CREATE POLICY "Public insert leads" ON public.leads FOR INSERT WITH CHECK (status = 'new' AND assigned_to IS NULL AND lead_id ~ '^(LD|QT)-[A-Fa-f0-9-]{36}$');
    CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (status = 'requested' AND lead_id IS NULL AND booking_id ~ '^BK-[A-Fa-f0-9-]{36}$');
    CREATE POLICY "Public insert pro applications" ON public.pro_applications FOR INSERT WITH CHECK (status = 'new' AND notes IS NULL AND document_url IS NULL AND application_id ~ '^PA-[A-Fa-f0-9-]{36}$');
  `)
})
afterAll(async () => {
  await db?.close()
})

describe('before the migration (confirms the gap is real in this model)', () => {
  it('lets the public anon role insert directly, skipping every server check', async () => {
    await as('anon', LEAD())
    await as('anon', BOOKING())
    await as('anon', PRO())
    expect(await count('leads')).toBe(1)
    expect(await count('bookings')).toBe(1)
    expect(await count('pro_applications')).toBe(1)
  })
})

describe('after the migration', () => {
  beforeAll(async () => {
    await db.exec(MIGRATION)
  })

  it.each([['anon'], ['authenticated']] as const)('denies direct inserts from %s on all three tables', async (role) => {
    for (const sql of [LEAD(), BOOKING(), PRO()]) await expect(as(role, sql)).rejects.toThrow(/permission denied/i)
  })

  it('still lets the server (service role) insert, bypassing the removed policies', async () => {
    await as('service_role', LEAD())
    await as('service_role', BOOKING())
    await as('service_role', PRO())
    expect(await count('leads')).toBe(2)
    expect(await count('bookings')).toBe(2)
    expect(await count('pro_applications')).toBe(2)
  })

  it('leaves public reads working and customer rows unreadable by the public', async () => {
    expect((await as('anon', 'SELECT question FROM public.faqs')).rows).toEqual([{ question: 'shown' }])
    expect((await as('authenticated', 'SELECT question FROM public.faqs')).rows).toEqual([{ question: 'shown' }])
    expect((await as('anon', 'SELECT id FROM public.leads')).rows).toEqual([])
  })

  it('does not change what anon and authenticated may read on the form tables (privileges other than INSERT stay)', async () => {
    const { rows } = await db.query<{ role: string; select: boolean; update: boolean; delete: boolean }>(`
      SELECT r AS role,
             has_table_privilege(r, 'public.leads', 'SELECT') AS "select",
             has_table_privilege(r, 'public.leads', 'UPDATE') AS "update",
             has_table_privilege(r, 'public.leads', 'DELETE') AS "delete"
      FROM (VALUES ('anon'), ('authenticated')) AS t(r)`)
    // Unchanged on purpose: narrowing these is a separate, reviewed step. RLS still returns nothing to them.
    expect(rows.every((r) => r.select && r.update && r.delete)).toBe(true)
  })
})

describe('rollback', () => {
  it('restores the original policies, so only well-formed public inserts work again', async () => {
    await db.exec(ROLLBACK)
    await db.exec(ROLLBACK) // safe to run twice
    await as('anon', LEAD())
    await expect(as('anon', LEAD('closed'))).rejects.toThrow(/row-level security/i)
    await expect(as('anon', `INSERT INTO public.leads (status, assigned_to, lead_id) VALUES ('new', NULL, 'bad-id')`)).rejects.toThrow(/row-level security/i)
    await as('authenticated', BOOKING())
    await as('anon', PRO())
    const { rows } = await db.query<{ policyname: string }>(`SELECT policyname FROM pg_policies WHERE schemaname='public' AND policyname LIKE 'Public insert%' ORDER BY 1`)
    expect(rows.map((r) => r.policyname)).toEqual(['Public insert bookings', 'Public insert leads', 'Public insert pro applications'])
  })

  it('can be followed by the migration again', async () => {
    await db.exec(MIGRATION)
    await expect(as('anon', LEAD())).rejects.toThrow(/permission denied/i)
  })
})
