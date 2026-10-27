import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { NextRequest } from 'next/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { pgliteSupabase } from '../helpers/pglite-supabase'

// Customer reviews: the migration's privileges (run as the real Supabase roles), POST /api/reviews against an
// in-process Postgres, and the /reviews page showing figures only once approved reviews exist.
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
const state = vi.hoisted(() => ({ client: null as unknown, summary: null as unknown, rate: { allowed: true } as { allowed: boolean; retryAfter?: number }, rateKeys: [] as string[] }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => state.client }))
vi.mock('@/lib/forms/spamProtection', async (load) => ({
  ...(await load<typeof import('@/lib/forms/spamProtection')>()),
  checkRateLimit: async (key: string) => {
    state.rateKeys.push(key)
    return state.rate
  },
}))
vi.mock('@/lib/cms/queries', () => ({ getReviewSummary: async () => state.summary }))
vi.mock('@/lib/supabase/auth', () => ({ verifyAdminAuth: async () => ({ authenticated: true, authorized: true, user: null, role: 'admin' }) }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { POST } from '@/app/api/reviews/route'
import ReviewsPage from '@/app/(site)/reviews/page'
import { GET as adminList, PUT as adminUpdate } from '@/app/api/admin/cms/[entity]/route'

const MIGRATION = readFileSync(path.join(__dirname, '../../supabase/migrations/20261027000000_customer_review_submissions.sql'), 'utf8')
let db: PGlite

async function as(role: 'anon' | 'authenticated' | 'service_role', sql: string) {
  await db.exec(`SET ROLE ${role}`)
  try {
    return await db.query(sql)
  } finally {
    await db.exec('RESET ROLE')
  }
}

const opened = () => new Date(Date.now() - 60_000).toISOString()
const review = (over: Record<string, unknown> = {}) => ({
  name: 'Dana R.', city: 'Denver', rating: 5, text: 'The water heater was replaced the same week and works perfectly.',
  service: 'Water Heater Replacement', email: 'dana@example.com', consent: true, formOpenedAt: opened(), ...over,
})
const post = (body: unknown, ip = '203.0.113.7') =>
  POST(new NextRequest('http://localhost/api/reviews', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-forwarded-for': `${ip}, 10.0.0.1` } }))
const testimonialCtx = { params: Promise.resolve({ entity: 'testimonial' }) }

beforeAll(async () => {
  db = new PGlite()
  // The production shape of the tables this migration touches, with Supabase's default grants.
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    CREATE TABLE public.profiles (id uuid PRIMARY KEY, role text);
    CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') $$;
    CREATE TABLE public.leads (id serial PRIMARY KEY, email text);
    INSERT INTO public.leads (email) VALUES ('Customer@Example.com');
    CREATE TABLE public.testimonials (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reviewer_name text NOT NULL, reviewer_city text, rating int DEFAULT 5,
      review_text text NOT NULL, service_name text, date text, verified boolean DEFAULT false, source text DEFAULT 'google',
      active boolean DEFAULT true, created_at timestamptz DEFAULT now(), display_order int NOT NULL DEFAULT 0, image_url text
    );
    ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public read active testimonials" ON public.testimonials FOR SELECT USING (active = true);
    CREATE POLICY "Admin manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin());
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  `)
  await db.exec(MIGRATION)
  await db.exec(MIGRATION)
  state.client = pgliteSupabase(db)
})
afterAll(async () => {
  await db?.close()
})

describe('customer review migration', () => {
  it.each([['anon'], ['authenticated']] as const)('keeps reviewer emails and the submit function away from %s', async (role) => {
    await expect(as(role, 'SELECT * FROM public.review_submissions')).rejects.toThrow(/permission denied/i)
    await expect(as(role, `SELECT public.submit_customer_review('a', '', 5, 'xxxxxxxxxxxxxxxxxxxxxxxx', '', 'a@b.co')`)).rejects.toThrow(/permission denied/i)
  })

  it('rejects ratings outside 1 to 5', async () => {
    await expect(db.query(`INSERT INTO public.testimonials (reviewer_name, review_text, rating) VALUES ('x', 'y', 6)`)).rejects.toThrow(/testimonials_rating_range/)
  })
})

describe('POST /api/reviews', () => {
  it('saves the review hidden, with the email stored privately', async () => {
    const res = await post(review())
    expect(res.status).toBe(201)
    const { rows } = await db.query<Record<string, unknown>>(`SELECT t.*, s.email, s.matches_request FROM public.testimonials t JOIN public.review_submissions s ON s.testimonial_id = t.id WHERE s.email = 'dana@example.com'`)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ reviewer_name: 'Dana R.', reviewer_city: 'Denver', rating: 5, active: false, verified: false, source: 'website', service_name: 'Water Heater Replacement', matches_request: false })
    expect(rows[0].date).toMatch(/^[A-Z][a-z]+ \d{4}$/)
    // Visitors (anon) see nothing until an admin approves it.
    expect((await as('anon', 'SELECT * FROM public.testimonials')).rows).toHaveLength(0)
  })

  it('flags a review whose email matches a service request, ignoring case', async () => {
    expect((await post(review({ email: 'customer@example.COM' }))).status).toBe(201)
    const { rows } = await db.query<{ matches_request: boolean }>(`SELECT matches_request FROM public.review_submissions WHERE email = 'customer@example.com'`)
    expect(rows).toEqual([{ matches_request: true }])
  })

  it('accepts one review per email per day', async () => {
    const res = await post(review({ text: 'A second review from the same person on the same day.' }))
    expect(res.status).toBe(409)
    expect(Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM public.review_submissions WHERE email = 'dana@example.com'`)).rows[0].n)).toBe(1)
  })

  it.each([
    ['no rating', { rating: 0 }, 'Choose a star rating.'],
    ['a very short review', { text: 'Great!' }, 'at least 20 characters'],
    ['a bad email', { email: 'nope' }, 'valid email'],
    ['a service not on the list', { service: 'Roofing' }, 'Choose a service from the list.'],
    ['no consent', { consent: false }, 'own experience'],
  ])('rejects %s', async (_label, over, message) => {
    const res = await post(review({ email: 'other@example.com', ...over }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain(message)
  })

  it('rate-limits by client IP and saves nothing when the limit is reached', async () => {
    state.rateKeys = []
    state.rate = { allowed: false, retryAfter: 600 }
    try {
      const res = await post(review({ email: 'limited@example.com' }), '198.51.100.4')
      expect(res.status).toBe(429)
    } finally {
      state.rate = { allowed: true }
    }
    expect(state.rateKeys).toEqual(['review:198.51.100.4'])
    expect((await db.query(`SELECT 1 FROM public.review_submissions WHERE email = 'limited@example.com'`)).rows).toHaveLength(0)
  })

  it('quietly drops bot submissions', async () => {
    const before = (await db.query('SELECT 1 FROM public.review_submissions')).rows.length
    expect((await post(review({ email: 'bot@example.com', website_url_hp: 'http://spam' }))).status).toBe(201)
    expect((await post(review({ email: 'fast@example.com', formOpenedAt: new Date().toISOString() }))).status).toBe(201)
    expect((await db.query('SELECT 1 FROM public.review_submissions')).rows.length).toBe(before)
  })
})

describe('admin approval', () => {
  it('shows the admin the private email and request match, then publishes on approval', async () => {
    const list = (await (await adminList(new NextRequest('http://localhost/api/admin/cms/testimonial'), testimonialCtx)).json()).items as Record<string, unknown>[]
    const dana = list.find((r) => r.reviewer_name === 'Dana R.')!
    expect(dana).toMatchObject({ active: false, source: 'website', submitted_email: 'dana@example.com', matches_request: false })
    expect(list.find((r) => r.submitted_email === 'customer@example.com')).toMatchObject({ matches_request: true })

    // The admin form sends the whole record back; source 'website' must validate and display-only fields are ignored.
    const res = await adminUpdate(
      new NextRequest(`http://localhost/api/admin/cms/testimonial?id=${dana.id}`, { method: 'PUT', body: JSON.stringify({ ...dana, id: undefined, active: true, verified: true }) }),
      testimonialCtx
    )
    expect(res.status).toBe(200)
    const visible = (await as('anon', 'SELECT reviewer_name, verified FROM public.testimonials')).rows
    expect(visible).toEqual([{ reviewer_name: 'Dana R.', verified: true }])
    // Approval never exposes the email: the private table is still closed to visitors.
    await expect(as('anon', 'SELECT email FROM public.review_submissions')).rejects.toThrow(/permission denied/i)
  })
})

describe('/reviews page', () => {
  const render = async () => renderToStaticMarkup((await ReviewsPage()) as ReactElement)

  it('shows no rating, count or summary before any review is approved', async () => {
    state.summary = { items: [], count: 0, average: null, verified: 0, distribution: [0, 0, 0, 0, 0] }
    const html = await render()
    expect(html).toContain('What customers say')
    expect(html).toContain('Be the first to share your experience')
    expect(html).toContain('Write a review')
    expect(html).not.toContain('Rating summary')
    expect(html).not.toMatch(/out of 5 stars|Based on|average/)
  })

  it('shows the figures computed from the approved reviews, and their cards', async () => {
    state.summary = {
      items: [
        { name: 'Dana R.', city: 'Denver', rating: 5, text: 'Fast and tidy work.', verified: true, service: 'AC Repair', date: 'October 2026' },
        { name: 'Lee', rating: 4, text: 'Good communication.', verified: false },
      ],
      count: 2, average: 4.5, verified: 1, distribution: [0, 0, 0, 1, 1],
    }
    const html = await render()
    expect(html).toContain('Rating summary')
    expect(html).toContain('4.5')
    expect(html).toContain('Based on 2 customer reviews')
    expect(html).toContain('1 from verified customers')
    expect(html).toContain('Fast and tidy work.')
    expect(html.match(/Verified customer</g)).toHaveLength(1)
  })
})
