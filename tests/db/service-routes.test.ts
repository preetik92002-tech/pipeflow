import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { pgliteSupabase } from '../helpers/pglite-supabase'

// The top-level service pages from migration 13, served by the real catch-all route on an in-process Postgres (no network).
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://pipeflowco.com')
const state = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => state.client }))
vi.mock('@/lib/cms/queries', () => ({ getPublishedBlogs: async () => [], getActiveReviews: async () => ({ items: [], count: 0, average: null }) }))

import CmsPage, { generateMetadata } from '@/app/(site)/[[...path]]/page'
import sitemap from '@/app/sitemap'

const dir = path.join(__dirname, '../../supabase/migrations')
let db: PGlite

const params = (p: string) => ({ params: Promise.resolve({ path: p.split('/') }) })
const html = async (p: string) => renderToStaticMarkup((await CmsPage(params(p))) as ReactElement)
const outcome = async (p: string) => {
  try {
    await CmsPage(params(p))
    return 'rendered'
  } catch (e) {
    return String((e as { digest?: string }).digest ?? e)
  }
}
const jsonLd = (markup: string) => [...markup.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>)
const types = (markup: string) => jsonLd(markup).map((l) => l['@type'])

async function publish(p: string, opts: { indexable?: boolean } = {}) {
  const { rows } = await db.query<{ id: string; version: number; title: string; description: string | null; sections: unknown; seo_title: string; seo_description: string }>(
    `select p.id, p.version, r.title, r.description, r.sections, r.seo_title, r.seo_description from cms_pages p join cms_page_revisions r on r.id = p.draft_revision_id where p.path = $1 and p.deleted_at is null`,
    [p]
  )
  let { id, version } = rows[0]
  if (opts.indexable) {
    const r = rows[0]
    const saved = await db.query<{ v: number }>(`select cms_save_draft($1,$2,$3,$4,$5,$6::jsonb,$7,$8,null,null,false,null) as v`, [id, version, r.title, p, r.description, JSON.stringify(r.sections), r.seo_title, r.seo_description])
    version = saved.rows[0].v
  }
  await db.query('select cms_publish($1, $2, null)', [id, version])
}

beforeAll(async () => {
  db = new PGlite()
  await db.exec(readFileSync(path.join(dir, '20261009000000_cms_pages.sql'), 'utf8'))
  await db.exec(readFileSync(path.join(dir, '20261013000000_service_pages.sql'), 'utf8'))
  state.client = pgliteSupabase(db)
})
afterAll(async () => {
  await db?.close()
})

describe('top-level service pages', () => {
  it('answer 404 while they are drafts', async () => {
    for (const p of ['heating-installation', 'hvac-services', 'water-heater-repair']) expect(await outcome(p), p).toMatch(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/)
  })

  it('publish as non-indexable pages and stay out of the sitemap until deliberately approved', async () => {
    await publish('heating-installation')
    expect(await outcome('heating-installation')).toBe('rendered')
    const meta = await generateMetadata(params('heating-installation'))
    expect(meta.robots).toBe('noindex,nofollow')
    expect(meta.alternates?.canonical).toBe('https://pipeflowco.com/heating-installation')
    expect((await sitemap()).map((e) => e.url)).not.toContain('https://pipeflowco.com/heating-installation')
    // No structured data is published for a page that asks not to be indexed.
    expect(types(await html('heating-installation'))).not.toContain('Service')
    expect(types(await html('heating-installation'))).not.toContain('BreadcrumbList')
  })

  it('never links to service pages that are not live', async () => {
    const markup = await html('heating-installation')
    for (const href of ['/hvac-services', '/ac-installation', '/ac-services', '/denver', '/boulder']) expect(markup, href).not.toContain(`href="${href}"`)
    // Their names still read as text in the breadcrumb, and the page keeps working.
    expect(markup).toContain('HVAC Services')
    expect(markup).toContain('aria-current="page"')
  })

  it('give an approved, indexable detail page Service and BreadcrumbList data that matches what is visible', async () => {
    await publish('hvac-services', { indexable: true })
    await publish('heating-installation', { indexable: true })
    const markup = await html('heating-installation')
    expect(markup).toContain('href="/hvac-services"')
    const ld = jsonLd(markup)
    const service = ld.find((l) => l['@type'] === 'Service')!
    expect(service.name).toBe('Heating Installation')
    expect(service.url).toBe('https://pipeflowco.com/heating-installation')
    const crumbs = ld.find((l) => l['@type'] === 'BreadcrumbList')!.itemListElement as { name: string; item: string }[]
    expect(crumbs.map((c) => c.name)).toEqual(['Home', 'HVAC Services', 'Heating Installation'])
    expect(crumbs[2].item).toBe('https://pipeflowco.com/heating-installation')
    expect((await generateMetadata(params('heating-installation'))).robots).toBe('index,follow')
    expect((await sitemap()).map((e) => e.url)).toContain('https://pipeflowco.com/heating-installation')
  })

  it('do not give a category page Service data, only breadcrumbs', async () => {
    const found = types(await html('hvac-services'))
    expect(found).not.toContain('Service')
    expect(found).toContain('BreadcrumbList')
  })
})
