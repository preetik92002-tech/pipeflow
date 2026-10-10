import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { validatePath } from '@/lib/cms-pages/paths'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'
import { seedPages } from '../../supabase/seed/pages'
import { buildSeedSql, OUTPUT } from '../../scripts/generate-seed-sql'

const dir = path.join(__dirname, '../../supabase/migrations')
const read = (f: string) => readFileSync(path.join(dir, f), 'utf8')

// Routes that exist in the app outside the CMS and may be linked to.
const STATIC_ROUTES = ['/book-service', '/get-a-quote', '/join-us', '/contact', '/about', '/blog']

function allHrefs(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => allHrefs(v, out))
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === 'href' && typeof v === 'string') out.push(v)
      else allHrefs(v, out)
    }
  }
  return out
}

describe('seed content', () => {
  const withIds = (p: (typeof seedPages)[number]) => p.sections.map((s, i) => ({ id: crypto.randomUUID(), ...s, _i: i }))

  it.each(seedPages.map((p) => [p.path || '(home)', p] as const))('%s passes the section schemas', (_name, page) => {
    const result = sectionsSchema.safeParse(withIds(page).map(({ _i, ...s }) => s))
    expect(result.success, JSON.stringify(result.error?.issues.slice(0, 3))).toBe(true)
  })

  it('uses valid, unique paths', () => {
    const paths = seedPages.map((p) => p.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const p of paths) expect(validatePath(p, { allowHome: true })).toBeNull()
  })

  it('includes every page the client asked for at the exact URLs', () => {
    const paths = seedPages.map((p) => p.path)
    for (const expected of ['plumbing/plumbing-repair', 'plumbing/water-heater-repair', 'plumbing/frozen-pipe-repair', 'hvac/ac-repair', 'hvac/ac-installation', 'denver', 'boulder']) {
      expect(paths).toContain(expected)
    }
    expect(seedPages.find((p) => p.path === 'hvac/ac-repair')?.title).toBe('AC Repair Services in Denver & Boulder')
    expect(seedPages.find((p) => p.path === 'hvac/ac-installation')?.title).toBe('AC Installation in Denver & Boulder')
  })

  it('includes every page in the structure document sitemap', () => {
    const paths = new Set(seedPages.map((p) => p.path))
    for (const expected of ['', 'plumbing', 'plumbing/plumbing-repair', 'plumbing/water-heater-repair', 'plumbing/water-heater-replacement', 'plumbing/frozen-pipe-repair', 'plumbing/plumbing-fixes', 'hvac', 'hvac/ac-repair', 'hvac/ac-installation', 'hvac/ac-replacement', 'hvac/hvac-repair', 'hvac/hvac-maintenance', 'commercial', 'commercial/plumbing', 'commercial/hvac', 'denver', 'boulder', 'find-a-pro', 'find-a-pro/plumbers', 'find-a-pro/hvac-contractors', 'for-contractors', 'resources']) {
      expect(paths.has(expected), expected).toBe(true)
    }
    // the 14 service + city landing pages, kept as drafts
    const cityPages = seedPages.filter((p) => /\/(denver|boulder)$/.test(p.path) && p.path.split('/').length === 3)
    expect(cityPages).toHaveLength(14)
    for (const p of cityPages) expect(p.draft).toBe(true)
  })

  it('never claims verification, reviews or specific prices', () => {
    const text = JSON.stringify(seedPages.filter((p) => p.path !== 'plumbing/water-heater-repair').map((p) => p.sections)).toLowerCase()
    for (const bad of ['5-star', 'five-star', 'verified professionals', 'licensed and insured', 'same-day', '24/7', '$']) expect(text.includes(bad), bad).toBe(false)
  })

  it('has no link to a page that does not exist', () => {
    const live = new Set(seedPages.filter((p) => !p.isTemplate && !p.draft).map((p) => (p.path === '' ? '/' : `/${p.path}`)))
    for (const page of seedPages) {
      for (const href of allHrefs(page.sections)) {
        if (!href.startsWith('/')) continue
        expect(live.has(href) || STATIC_ROUTES.includes(href), `${page.path || '(home)'} links to missing ${href}`).toBe(true)
      }
    }
  })

  it('uses the Denver and Boulder headlines and copy exactly as supplied', () => {
    for (const city of ['Denver', 'Boulder']) {
      const hero = seedPages.find((p) => p.path === city.toLowerCase())!.sections[0].data
      expect(hero.heading).toBe(`Trusted Plumbing & HVAC Services in ${city}, Colorado`)
      expect(hero.subtitle).toBe(
        `Find local plumbing and HVAC professionals serving ${city}. Request plumbing repairs, water heater services, frozen pipe repair, AC repair, AC installation and other residential or commercial services.`
      )
    }
  })

  it('the committed migration matches the seed (run npm run seed:sql if this fails)', () => {
    expect(readFileSync(path.join(__dirname, '../..', OUTPUT), 'utf8')).toBe(buildSeedSql())
  })
})

describe('seed migration', () => {
  let db: PGlite
  beforeAll(async () => {
    db = new PGlite()
    await db.exec(read('20261009000000_cms_pages.sql'))
    await db.exec(read('20261009000100_seed_cms_pages.sql'))
  })

  it('creates every page; all are live except the template and drafts', async () => {
    const r = await db.query<{ path: string; status: string; is_template: boolean }>('select path, status, is_template from cms_pages order by path')
    expect(r.rows).toHaveLength(seedPages.length)
    const drafts = new Set(seedPages.filter((p) => p.draft || p.isTemplate).map((p) => p.path))
    for (const row of r.rows) expect(row.status).toBe(drafts.has(row.path) ? 'draft' : 'published')
  })

  it('stores the water heater copy and its eight FAQs', async () => {
    const r = await db.query<{ sections: { type: string; data: { items?: unknown[] } }[]; seo_title: string }>(
      `select r.sections, r.seo_title from cms_pages p join cms_page_revisions r on r.id = p.published_revision_id where p.path = 'plumbing/water-heater-repair'`
    )
    expect(r.rows[0].seo_title).toBe('Water Heater Repair, Replacement & Installation Denver & Boulder')
    expect(r.rows[0].sections.find((s) => s.type === 'faq')?.data.items).toHaveLength(8)
  })

  it('sets noindex on starter pages and not on the finished ones', async () => {
    const r = await db.query<{ path: string; noindex: boolean }>(
      `select p.path, r.noindex from cms_pages p join cms_page_revisions r on r.id = p.draft_revision_id`
    )
    const byPath = Object.fromEntries(r.rows.map((x) => [x.path, x.noindex]))
    expect(byPath['plumbing/water-heater-repair']).toBe(false)
    expect(byPath['denver']).toBe(false)
    expect(byPath['hvac/ac-repair']).toBe(true)
  })

  it('is safe to run twice and never overwrites existing pages', async () => {
    await db.query(`select cms_save_draft(id, version, 'Edited by the client', path, null, '[]'::jsonb, null, null, null, null, false, null) from cms_pages where path = 'denver'`)
    await db.exec(read('20261009000100_seed_cms_pages.sql'))
    const count = await db.query<{ n: number }>('select count(*)::int as n from cms_pages')
    expect(count.rows[0].n).toBe(seedPages.length)
    const t = await db.query<{ title: string }>(`select title from cms_pages where path = 'denver'`)
    expect(t.rows[0].title).toBe('Edited by the client')
  })
})
