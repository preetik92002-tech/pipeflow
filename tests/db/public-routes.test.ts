import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { pgliteSupabase } from '../helpers/pglite-supabase'

// The public catch-all page, its metadata, the sitemap and the admin preview, running on the
// real seed content in an in-process Postgres. No network: the Supabase URL is blanked so the
// SEO/company settings fall back to the built-in defaults, and blog posts are stubbed.
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://pipeflowco.com')
const state = vi.hoisted(() => ({ client: null as unknown, auth: { authenticated: false, authorized: false, user: null, role: null } as Record<string, unknown> }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => state.client }))
vi.mock('@/lib/supabase/auth', () => ({ verifyAdminAuth: async () => state.auth }))
vi.mock('@/lib/cms/queries', () => ({ getPublishedBlogs: async () => [] }))

import CmsPage, { generateMetadata } from '@/app/(site)/[[...path]]/page'
import PreviewPage from '@/app/(site)/preview/[id]/page'
import sitemap from '@/app/sitemap'

const dir = path.join(__dirname, '../../supabase/migrations')
let db: PGlite

const CITY_URLS = ['plumbing/plumbing-repair', 'plumbing/water-heater-repair', 'plumbing/frozen-pipe-repair', 'hvac/ac-repair', 'hvac/ac-installation']
  .flatMap((s) => [`${s}/denver`, `${s}/boulder`])
const REQUIRED = ['plumbing/plumbing-repair', 'plumbing/water-heater-repair', 'plumbing/frozen-pipe-repair', 'hvac/ac-repair', 'hvac/ac-installation', 'denver', 'boulder']

const params = (p: string) => ({ params: Promise.resolve({ path: p === '' ? undefined : p.split('/') }) })
async function render(p: string): Promise<string> {
  return renderToStaticMarkup((await CmsPage(params(p))) as ReactElement)
}
/** The Next.js error code a page threw (404 page, redirect), or null if it rendered. */
async function outcome(p: string): Promise<string | null> {
  try {
    await CmsPage(params(p))
    return null
  } catch (e) {
    return String((e as { digest?: string }).digest ?? e)
  }
}
const idOf = async (p: string) => (await db.query<{ id: string; version: number }>('select id, version from cms_pages where path = $1', [p])).rows[0]
const sitemapUrls = async () => (await sitemap()).map((e) => e.url)

beforeAll(async () => {
  db = new PGlite()
  await db.exec(readFileSync(path.join(dir, '20261009000000_cms_pages.sql'), 'utf8'))
  await db.exec(readFileSync(path.join(dir, '20261009000100_seed_cms_pages.sql'), 'utf8'))
  state.client = pgliteSupabase(db)
})

describe('public pages', () => {
  it.each(REQUIRED)('/%s renders with its own canonical URL', async (p) => {
    const html = await render(p)
    expect(html).toContain('<h1')
    const meta = await generateMetadata(params(p))
    expect(meta.alternates?.canonical).toBe(`https://pipeflowco.com/${p}`)
  })

  it('indexes the finished pages and keeps starter pages out of search', async () => {
    const robots = async (p: string) => (await generateMetadata(params(p))).robots
    expect(await robots('plumbing/water-heater-repair')).toBe('index,follow')
    expect(await robots('denver')).toBe('index,follow')
    expect(await robots('hvac/ac-repair')).toBe('noindex,nofollow')
  })

  it('adds FAQ structured data that matches the visible FAQ', async () => {
    const html = await render('plumbing/water-heater-repair')
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity).toHaveLength(8)
    expect(html).toContain('How much does water heater repair cost in Denver or Boulder?')
  })
})

describe('city/service URLs', () => {
  it.each(CITY_URLS)('/%s is a draft, so visitors get the 404 page and search engines a noindex', async (p) => {
    expect(await outcome(p)).toMatch(/NEXT_HTTP_ERROR_FALLBACK;404/)
    expect((await generateMetadata(params(p))).robots).toBe('noindex')
  })

  it('old draft addresses are not pages and do not redirect anywhere', async () => {
    for (const p of ['water/water-heater-repair/denver', 'ac/ac-repair/boulder', 'frozen/frozen-pipe-repair/denver']) {
      expect(await outcome(p)).toMatch(/NEXT_HTTP_ERROR_FALLBACK;404/)
    }
  })

  it('malformed or differently-cased addresses never reach another page', async () => {
    for (const p of ['Denver', 'plumbing/Water-Heater-Repair', 'admin/pages', 'plumbing//denver']) {
      expect(await outcome(p)).toMatch(/NEXT_HTTP_ERROR_FALLBACK;404/)
    }
  })

  it('a city page resolves at /<trade>/<service>/<city> once published, and stays out of the sitemap while hidden', async () => {
    const page = await idOf('plumbing/water-heater-repair/denver')
    await db.query('select cms_publish($1, $2, null)', [page.id, page.version])
    try {
      const html = await render('plumbing/water-heater-repair/denver')
      expect(html).toContain('Water Heater Repair in Denver, Colorado')
      const meta = await generateMetadata(params('plumbing/water-heater-repair/denver'))
      expect(meta.alternates?.canonical).toBe('https://pipeflowco.com/plumbing/water-heater-repair/denver')
      expect(meta.robots).toBe('noindex,nofollow')
      expect(await sitemapUrls()).not.toContain('https://pipeflowco.com/plumbing/water-heater-repair/denver')
    } finally {
      await db.query('select cms_unpublish($1, $2, null)', [page.id, page.version + 1])
    }
    expect(await outcome('plumbing/water-heater-repair/denver')).toMatch(/404/)
  })
})

describe('sitemap', () => {
  it('lists the live indexable pages only', async () => {
    const urls = await sitemapUrls()
    for (const p of ['', '/plumbing/water-heater-repair', '/denver', '/boulder']) expect(urls).toContain(`https://pipeflowco.com${p}`)
    for (const p of ['/hvac/ac-repair', '/plumbing/plumbing-repair', '/service-page-template', '/privacy', ...CITY_URLS.map((c) => `/${c}`)]) {
      expect(urls).not.toContain(`https://pipeflowco.com${p}`)
    }
  })
})

describe('admin preview', () => {
  it('sends visitors who are not admins to the login page', async () => {
    const page = await idOf('hvac/ac-installation/boulder')
    state.auth = { authenticated: true, authorized: false, user: { id: 'u' }, role: 'customer' }
    await expect(PreviewPage({ params: Promise.resolve({ id: page.id }) })).rejects.toMatchObject({ digest: expect.stringMatching(/^NEXT_REDIRECT;.*\/admin\/login\?redirectTo=/) })
  })

  it('shows an admin the saved draft, marked as not visible to visitors', async () => {
    const page = await idOf('hvac/ac-installation/boulder')
    state.auth = { authenticated: true, authorized: true, user: { id: 'a' }, role: 'super_admin' }
    const html = renderToStaticMarkup((await PreviewPage({ params: Promise.resolve({ id: page.id }) })) as ReactElement)
    expect(html).toContain('not visible to visitors')
    expect(html).toContain('AC Installation in Boulder, Colorado')
  })
})

afterAll(async () => {
  await db?.close()
})
