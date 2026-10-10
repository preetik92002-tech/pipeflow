import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { NextRequest } from 'next/server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { pgliteSupabase } from '../helpers/pglite-supabase'
import { seedPages } from '../../supabase/seed/pages'

// The real request route saving into a real `leads` table (built from the migrations).
const state = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => state.client }))
vi.mock('@/lib/forms/spamProtection', async (actual) => ({
  ...(await actual<typeof import('@/lib/forms/spamProtection')>()),
  checkRateLimit: async () => ({ allowed: true }),
}))

import { POST } from '@/app/api/service-requests/route'
import { toPrefill } from '@/lib/requests/prefill'

const dir = path.join(__dirname, '../../supabase/migrations')
let db: PGlite

beforeAll(async () => {
  db = new PGlite()
  const initial = readFileSync(path.join(dir, '20250101000000_initial_schema.sql'), 'utf8')
  const leads = initial.match(/CREATE TABLE IF NOT EXISTS public\.leads \([\s\S]*?\n\);/)![0]
    .replace('extensions.uuid_generate_v4()', 'gen_random_uuid()')
    .replace(/REFERENCES public\.profiles\(id\) ON DELETE SET NULL/, '')
  await db.exec(leads)
  await db.exec('ALTER TABLE public.leads ALTER COLUMN zip_code DROP NOT NULL;')
  const fields = readFileSync(path.join(dir, '20261010000000_service_request_fields.sql'), 'utf8')
  await db.exec(fields.match(/ALTER TABLE public\.leads[\s\S]*?;/)![0])
  state.client = pgliteSupabase(db)
})
beforeEach(async () => {
  await db.exec('truncate leads')
})

const base = {
  customerType: 'homeowner', category: 'plumbing', description: 'The water heater makes a banging noise.', urgency: 'soon',
  city: 'Denver', address: '123 Example St', zip: '80202', name: 'Sam Example', phone: '(303) 555-0100', email: 'sam@example.com',
  formOpenedAt: new Date(Date.now() - 60_000).toISOString(),
}
const submit = (body: Record<string, unknown>) =>
  POST(new NextRequest('http://localhost/api/service-requests', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost' }, body: JSON.stringify(body) }))
const saved = async () => (await db.query<Record<string, unknown>>('select * from leads')).rows

/** What a button's link pre-selects in the request form, using the page's own prefill rules. */
const prefill = (href: string) => {
  const p = toPrefill(Object.fromEntries(new URL(href, 'http://x').searchParams))
  return { category: p.category, service: p.service, customerType: p.customerType }
}

describe('water heater lead flow', () => {
  it.each([
    ['water-heater-repair', 'Water Heater Repair'],
    ['water-heater-replacement', 'Water Heater Replacement'],
    ['water-heater-installation', 'Water Heater Installation'],
  ])('saves a %s request as "%s"', async (service, label) => {
    const res = await submit({ ...base, service })
    expect(res.status).toBe(201)
    const rows = await saved()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ service_category: 'Plumbing', specific_service: label, customer_type: 'homeowner', service_area: 'Denver' })
  })

  it('saves a commercial request as a business lead with the service the customer chose', async () => {
    const res = await submit({ ...base, customerType: 'business', service: 'water-heater-installation', business: { name: 'Acme Apartments', propertyType: 'Apartment or rental building', equipment: '2 x 100 gal tanks' } })
    expect(res.status).toBe(201)
    const [row] = await saved()
    expect(row).toMatchObject({ customer_type: 'business', specific_service: 'Water Heater Installation' })
    expect(row.details).toEqual({ business: { name: 'Acme Apartments', propertyType: 'Apartment or rental building', equipment: '2 x 100 gal tanks' } })
  })

  it('rejects an unknown or mismatched service and saves nothing', async () => {
    expect((await submit({ ...base, service: 'water-heater-teleport' })).status).toBe(400)
    expect((await submit({ ...base, service: 'ac-installation' })).status).toBe(400)
    expect(await saved()).toEqual([])
  })

  it('still accepts the service values stored on older leads', async () => {
    for (const service of ['plumbing-repair', 'water-heater-repair', 'water-heater-replacement', 'frozen-pipe-repair', 'plumbing-fixes', 'other-plumbing']) {
      expect((await submit({ ...base, service })).status, service).toBe(201)
    }
  })

  it('every water heater button pre-selects the matching service', () => {
    const page = seedPages.find((p) => p.path === 'plumbing/water-heater-repair')!
    const buttons = new Map<string, string>()
    JSON.stringify(page.sections).replace(/"label":"([^"]+)","href":"([^"]+)"/g, (_, l: string, h: string) => (buttons.set(l, h), ''))
    const home = { category: 'plumbing', customerType: 'homeowner' }
    expect(prefill(buttons.get('Request Water Heater Repair')!)).toEqual({ ...home, service: 'water-heater-repair' })
    expect(prefill(buttons.get('Get Water Heater Replacement Help')!)).toEqual({ ...home, service: 'water-heater-replacement' })
    expect(prefill(buttons.get('Request Water Heater Installation')!)).toEqual({ ...home, service: 'water-heater-installation' })
    expect(prefill(buttons.get('Explore Water Heater Installation Options')!)).toEqual({ ...home, service: 'water-heater-installation' })
    // Commercial: business request; the customer then picks repair, replacement or installation.
    expect(prefill(buttons.get('Request Commercial Water Heater Service')!)).toEqual({ category: 'plumbing', customerType: 'business', service: undefined })
  })
})

afterAll(async () => {
  await db?.close()
})
