import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  path.join(__dirname, '../../supabase/migrations/20261014000000_server_only_public_form_writes.sql'),
  'utf8'
)

describe('public form write policy migration', () => {
  it('removes direct public INSERT access while retaining the server role and stays rerunnable', async () => {
    const db = new PGlite()
    try {
      await db.exec(`
        CREATE ROLE anon;
        CREATE ROLE authenticated;
        CREATE ROLE service_role;
        CREATE TABLE public.leads (id integer);
        CREATE TABLE public.bookings (id integer);
        CREATE TABLE public.pro_applications (id integer);
        GRANT INSERT ON public.leads, public.bookings, public.pro_applications TO PUBLIC, anon, authenticated, service_role;
        ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.pro_applications ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Public insert leads" ON public.leads FOR INSERT WITH CHECK (true);
        CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
        CREATE POLICY "Public insert pro applications" ON public.pro_applications FOR INSERT WITH CHECK (true);
      `)

      await db.exec(migration)
      await db.exec(migration)

      const { rows } = await db.query<{ table_name: string; anon_insert: boolean; auth_insert: boolean; service_insert: boolean }>(`
        SELECT table_name,
          has_table_privilege('anon', format('public.%I', table_name), 'INSERT') AS anon_insert,
          has_table_privilege('authenticated', format('public.%I', table_name), 'INSERT') AS auth_insert,
          has_table_privilege('service_role', format('public.%I', table_name), 'INSERT') AS service_insert
        FROM (VALUES ('leads'), ('bookings'), ('pro_applications')) AS t(table_name)
        ORDER BY table_name
      `)
      expect(rows).toEqual([
        { table_name: 'bookings', anon_insert: false, auth_insert: false, service_insert: true },
        { table_name: 'leads', anon_insert: false, auth_insert: false, service_insert: true },
        { table_name: 'pro_applications', anon_insert: false, auth_insert: false, service_insert: true },
      ])

      const policies = await db.query<{ count: string }>(`
        SELECT count(*)::text AS count FROM pg_policies
        WHERE schemaname = 'public' AND policyname IN (
          'Public insert leads', 'Public insert bookings', 'Public insert pro applications'
        )
      `)
      expect(policies.rows[0].count).toBe('0')
    } finally {
      await db.close()
    }
  })
})
