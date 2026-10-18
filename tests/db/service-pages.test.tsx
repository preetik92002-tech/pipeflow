import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, describe, expect, it } from 'vitest'
import { SectionRenderer } from '@/components/cms/SectionRenderer'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'
import { servicePageDefaults } from '@/lib/cms-pages/sections/registry'
import { validatePath } from '@/lib/cms-pages/paths'
import { faqJsonLd } from '@/lib/cms-pages/jsonld'
import { serviceLabel } from '@/lib/requests/schema'
import { servicePages } from '../../supabase/seed/service-pages'
import { buildServicePagesSql, SERVICE_OUTPUT } from '../../scripts/generate-seed-sql'

const dir = path.join(__dirname, '../../supabase/migrations')
const read = (f: string) => readFileSync(path.join(dir, f), 'utf8')
const withIds = (p: (typeof servicePages)[number]) => [{ id: crypto.randomUUID(), type: p.type, data: p.data }]
const render = (p: (typeof servicePages)[number]) => renderToStaticMarkup(<SectionRenderer sections={withIds(p)} ctx={{ kind: 'page', crumbs: [] }} />)

const open: PGlite[] = []
afterAll(async () => { await Promise.all(open.splice(0).map((d) => d.close())) })

describe('service page seed', () => {
  it('has the pages at the agreed URLs, each valid for its template', () => {
    expect(servicePages.map((p) => p.path)).toEqual(['plumbing-services', 'hvac-services', 'water-heater-repair', 'water-heater-installation-replacement', 'frozen-pipe-repair', 'ac-services', 'ac-installation', 'heating-installation'])
    for (const p of servicePages) {
      expect(validatePath(p.path), p.path).toBeNull()
      const r = sectionsSchema.safeParse(withIds(p))
      expect(r.success, `${p.path} ${JSON.stringify(r.error?.issues.slice(0, 2))}`).toBe(true)
    }
    expect(servicePages.filter((p) => p.type === 'serviceCategory').map((p) => p.path)).toEqual(['plumbing-services', 'hvac-services'])
  })

  it('uses real request-catalog service ids and never invents a service', () => {
    const ok = ['plumbing:water-heater-repair', 'plumbing:water-heater-replacement', 'plumbing:frozen-pipe-repair', 'hvac:ac-repair', 'hvac:ac-installation', 'hvac:heating-installation']
    for (const p of servicePages) expect(ok, p.path).toContain(p.data.formService)
  })

  it('does not invent prices, guarantees, reviews or contact details', () => {
    for (const p of servicePages) {
      const text = JSON.stringify(p.data)
      expect(text, p.path).not.toMatch(/\$\d|24\/7|licensed and insured|our (plumbers|technicians)|\d{3}[-.)\s]\d{3}[-.]\d{4}/i)
      expect(text).toContain('does not guarantee immediate service')
    }
  })

  it('keeps the open-flame warning explicit on the frozen pipe page', () => {
    const html = render(servicePages.find((p) => p.path === 'frozen-pipe-repair')!)
    expect(html).toContain('Never use an open flame')
    expect(html).toContain('not wait for a form response'.replace('not wait', "n&#x27;t wait"))
  })
})

describe('service page rendering', () => {
  it('renders four primary sections, one H1, a real form and native FAQ disclosure', () => {
    for (const p of servicePages) {
      const html = render(p)
      expect((html.match(/<section/g) ?? []).length, p.path).toBe(4)
      expect((html.match(/<h1/g) ?? []).length).toBe(1)
      expect(html).toContain('id="request"')
      expect(html).toContain('<details')
      expect(html).toContain('e.g. 80202')
      expect(html).not.toMatch(/preview-only|alert\(/i)
    }
  })

  it('category pages link every card to its service page', () => {
    const html = render(servicePages[0])
    for (const href of ['/water-heater-repair', '/water-heater-installation-replacement', '/frozen-pipe-repair']) expect(html).toContain(`href="${href}"`)
    expect(html.match(/Learn More/g)?.length).toBe(3)
  })

  it('shows the repair-or-replace comparison as a real table', () => {
    const html = render(servicePages.find((p) => p.path === 'water-heater-repair')!)
    expect(html).toContain('<table')
    expect(html).toContain('May favor replacement')
  })

  it('renders CMS text as plain text, never as HTML', () => {
    const data = { ...servicePageDefaults('detail'), heading: 'x', intro: '<script>alert(1)</script><img src=x onerror=alert(1)>', finalHeading: 'y' }
    const html = renderToStaticMarkup(<SectionRenderer sections={[{ id: crypto.randomUUID(), type: 'serviceDetail', data }]} ctx={{ kind: 'page', crumbs: [] }} />)
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img src=x')
  })

  it('exposes FAQ structured data and rejects unknown services on the server schema', () => {
    expect(faqJsonLd(withIds(servicePages[2]))?.mainEntity).toHaveLength(7)
    const bad = [{ id: crypto.randomUUID(), type: 'serviceDetail', data: { ...servicePageDefaults('detail'), formService: 'plumbing:made-up' } }]
    expect(sectionsSchema.safeParse(bad).success).toBe(false)
  })

  it('the homepage renderer path is unaffected: no service template on a home context', () => {
    const html = renderToStaticMarkup(<SectionRenderer sections={[]} ctx={{ kind: 'home', crumbs: [] }} />)
    expect(html).not.toContain('data-service-page')
  })
})

describe('service pages migration', () => {
  it('matches the generator (run npm run seed:sql if this fails)', () => {
    expect(read('20261013000000_service_pages.sql').replace(/\r\n/g, '\n')).toBe(buildServicePagesSql())
    expect(SERVICE_OUTPUT.endsWith('20261013000000_service_pages.sql')).toBe(true)
  })

  it('creates the pages as drafts, never overwrites, and is safe to run twice', async () => {
    const db = new PGlite()
    open.push(db)
    await db.exec(read('20261009000000_cms_pages.sql'))
    await db.exec(`select cms_create_page('Edited','water-heater-repair',null,'[]'::jsonb,'s','d',null,null,false,false,null)`)
    await db.exec(read('20261013000000_service_pages.sql'))
    await db.exec(read('20261013000000_service_pages.sql'))
    const { rows } = await db.query<{ path: string; status: string; title: string }>('select path, status, title from cms_pages order by path')
    expect(rows.map((r) => r.path)).toEqual(['ac-installation', 'ac-services', 'frozen-pipe-repair', 'heating-installation', 'hvac-services', 'plumbing-services', 'water-heater-installation-replacement', 'water-heater-repair'])
    expect(rows.filter((r) => r.path !== 'water-heater-repair').every((r) => r.status === 'draft')).toBe(true)
    expect(rows.find((r) => r.path === 'water-heater-repair')?.title).toBe('Edited')
    expect(rows.find((r) => r.path === 'water-heater-repair')?.status).toBe('draft')
  })

  it('creates every new page non-indexable, so publishing cannot make an unapproved page indexable', async () => {
    const db = new PGlite()
    open.push(db)
    await db.exec(read('20261009000000_cms_pages.sql'))
    await db.exec(read('20261013000000_service_pages.sql'))
    const { rows } = await db.query<{ path: string; noindex: boolean; canonical_url: string | null }>(
      'select p.path, r.noindex, r.canonical_url from cms_pages p join cms_page_revisions r on r.id = p.draft_revision_id order by p.path'
    )
    expect(rows).toHaveLength(8)
    expect(rows.every((r) => r.noindex === true && r.canonical_url === null)).toBe(true)
  })

  it('reports and preserves an existing published page with conflicting content', async () => {
    const db = new PGlite()
    open.push(db)
    await db.exec(read('20261009000000_cms_pages.sql'))
    const sections = [{ id: '00000000-0000-4000-8000-000000000001', type: 'hero', data: { heading: 'Administrator content' } }]
    const { rows: created } = await db.query<{ id: string }>(
      `select cms_create_page('Existing legacy page','ac-installation',null,$1::jsonb,'s','d',null,null,false,false,null) as id`,
      [JSON.stringify(sections)]
    )
    await db.query('select cms_publish($1, 1, null)', [created[0].id])
    const before = await db.query('select id, title, status, is_template, draft_revision_id, published_revision_id from cms_pages where id = $1', [created[0].id])

    await db.exec(read('20261013000000_service_pages.sql'))

    const after = await db.query('select id, title, status, is_template, draft_revision_id, published_revision_id from cms_pages where id = $1', [created[0].id])
    expect(after.rows).toEqual(before.rows)
    const count = await db.query<{ n: number }>("select count(*)::int as n from cms_pages where path = 'ac-installation' and deleted_at is null")
    expect(count.rows[0].n).toBe(1)
    expect(buildServicePagesSql()).toContain('RAISE NOTICE \'service page seed skipped existing record')
  })
})

describe('AC and heating pages', () => {
  const page = (p: string) => servicePages.find((x) => x.path === p)!
  it('use the individual-service template with the supplied titles and descriptions', () => {
    expect(page('ac-services').seoTitle).toBe('Air Conditioning Services in Denver & Boulder, CO | PipeFlowCo')
    expect(page('ac-installation').seoTitle).toBe('AC Installation in Denver & Boulder, CO | PipeFlowCo')
    expect(page('heating-installation').seoTitle).toBe('Heating System Installation in Denver & Boulder, CO | PipeFlowCo')
    for (const p of ['ac-services', 'ac-installation', 'heating-installation']) expect(page(p).type).toBe('serviceDetail')
  })
  it('the HVAC category page cards and every related link resolve to a seeded page or existing area', () => {
    const known = new Set(['/' + servicePages.map((p) => p.path).join('|/').split('|').join('|/')].join('').split('|'))
    const paths = new Set(servicePages.map((p) => '/' + p.path))
    const hrefs = JSON.stringify(servicePages.map((p) => p.data)).match(/"href":"([^"]+)"/g)!.map((h) => h.slice(8, -1))
    for (const h of hrefs) expect(h === '/' || h === '/denver' || h === '/boulder' || paths.has(h), h).toBe(true)
    expect(known.size).toBeGreaterThan(0)
  })
  it('heating installation reuses the Something else option without inventing an id, and shows its own label', () => {
    const d = page('heating-installation').data
    expect(d.formService).toBe('hvac:other-hvac')
    const html = render(page('heating-installation'))
    expect(html).toContain('>Heating Installation</option>')
    expect(sectionsSchema.safeParse(withIds(page('heating-installation'))).success).toBe(true)
  })
  it('the AC page keeps the service-availability notice and the electrical/refrigerant warning', () => {
    const html = render(page('ac-services'))
    expect(html).toContain('depends on your location and provider')
    expect(html).toContain('handle refrigerant')
  })
})
