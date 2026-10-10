import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { NextRequest } from 'next/server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { pgliteSupabase } from '../helpers/pglite-supabase'

// Real repository + API routes + SQL functions on an in-process Postgres.
// Only the login check and Next's cache are replaced.
const state = vi.hoisted(() => ({
  client: null as unknown,
  auth: { authenticated: true, authorized: true, user: { id: '00000000-0000-0000-0000-0000000000aa' }, role: 'super_admin' } as Record<string, unknown>,
}))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => state.client }))
vi.mock('@/lib/supabase/auth', () => ({ verifyAdminAuth: async () => state.auth }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { duplicatePage, listPages, listPagesPage, saveDraft, CmsError } from '@/lib/cms-pages/repository'
import { GET as listRoute } from '@/app/api/admin/pages/route'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'
import { contentKey } from '@/lib/cms-pages/publish-checks'
import { POST as publishRoute } from '@/app/api/admin/pages/[id]/publish/route'
import { POST as duplicateRoute } from '@/app/api/admin/pages/[id]/duplicate/route'

const ADMIN = { authenticated: true, authorized: true, user: { id: '00000000-0000-0000-0000-0000000000aa' }, role: 'super_admin' }
let db: PGlite

const hero = (heading: string) => ({ id: crypto.randomUUID(), type: 'hero', data: { eyebrow: '', heading, subtitle: '', intro: '', image: '', buttons: [], align: 'left' } })

async function create(p: string, opts: { title?: string; seoTitle?: string | null; seoDescription?: string | null; noindex?: boolean; publish?: boolean } = {}) {
  const { rows } = await db.query<{ id: string }>(
    `select cms_create_page($1,$2,'Intro',$3::jsonb,$4,$5,null,null,$6,false,null) as id`,
    [opts.title ?? 'Water Heater Repair', p, JSON.stringify([hero('One'), hero('Two')]), opts.seoTitle ?? null, opts.seoDescription ?? null, opts.noindex ?? false]
  )
  if (opts.publish) await db.query('select cms_publish($1, 1, null)', [rows[0].id])
  return rows[0].id
}
const row = async (id: string) => (await db.query<Record<string, unknown>>('select * from cms_pages where id = $1', [id])).rows[0]
const draft = async (id: string) =>
  (await db.query<{ seo_title: string | null; seo_description: string | null; noindex: boolean; sections: { id: string; type: string; data: unknown }[] }>(
    'select r.* from cms_pages p join cms_page_revisions r on r.id = p.draft_revision_id where p.id = $1', [id]
  )).rows[0]

function req(url: string, body?: unknown, origin = 'http://localhost') {
  return new NextRequest(`http://localhost${url}`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: body === undefined ? undefined : JSON.stringify(body) })
}
const publish = (id: string, version: number, origin?: string) =>
  publishRoute(req(`/api/admin/pages/${id}/publish`, { version }, origin), { params: Promise.resolve({ id }) })

beforeAll(async () => {
  db = new PGlite()
  await db.exec(readFileSync(path.join(__dirname, '../../supabase/migrations/20261009000000_cms_pages.sql'), 'utf8'))
  state.client = pgliteSupabase(db)
})
beforeEach(async () => {
  state.auth = { ...ADMIN }
  await db.exec('truncate cms_redirects, cms_audit_log, cms_page_revisions, cms_pages restart identity cascade')
})

describe('duplicating a page', () => {
  it('leaves the original untouched', async () => {
    const id = await create('plumbing/water-heater-repair', { seoTitle: 'WH title', seoDescription: 'WH desc', publish: true })
    const before = { page: await row(id), rev: await draft(id) }
    await duplicatePage(id, null)
    expect(await row(id)).toEqual(before.page)
    expect(await draft(id)).toEqual(before.rev)
  })

  it('creates an unpublished draft at a unique -copy URL every time', async () => {
    const id = await create('plumbing/water-heater-repair', { publish: true })
    const first = await duplicatePage(id, null)
    const second = await duplicatePage(id, null)
    expect((await row(first)).path).toBe('plumbing/water-heater-repair-copy')
    expect((await row(second)).path).toBe('plumbing/water-heater-repair-copy-2')
    for (const copy of [first, second]) {
      const r = await row(copy)
      expect(r.status).toBe('draft')
      expect(r.published_revision_id).toBeNull()
      expect(r.published_at).toBeNull()
    }
  })

  it('gives every section a new id but keeps the content', async () => {
    const id = await create('hvac/ac-repair')
    const copy = await duplicatePage(id, null)
    const [a, b] = [await draft(id), await draft(copy)]
    expect(a.sections).toHaveLength(2)
    expect(b.sections).toHaveLength(2)
    // Copy schema se guzarkar bani hai (naye fields ke defaults ke saath), isliye dono ko normalise karke compare.
    const norm = (sections: unknown) => sectionsSchema.parse(sections).map((s) => ({ ...s, id: '' }))
    b.sections.forEach((s, i) => expect(s.id).not.toBe(a.sections[i].id))
    expect(norm(b.sections)).toEqual(norm(a.sections))
  })

  it('treats a copy as identical to its original even when the schema has gained fields since the original was saved', () => {
    const original = [{ id: crypto.randomUUID(), type: 'hero', data: { heading: 'H', buttons: [] } }]
    const copy = sectionsSchema.parse(original).map((s) => ({ ...s, id: crypto.randomUUID() }))
    expect(contentKey(copy)).toBe(contentKey(original))
  })

  it('hides the copy from search engines and clears its SEO fields', async () => {
    const id = await create('denver', { seoTitle: 'Denver', seoDescription: 'Denver desc', noindex: false, publish: true })
    const copy = await draft(await duplicatePage(id, null))
    expect(copy.noindex).toBe(true)
    expect(copy.seo_title).toBeNull()
    expect(copy.seo_description).toBeNull()
  })

  it('requires an admin', async () => {
    const id = await create('denver')
    state.auth = { authenticated: false, authorized: false, user: null, role: null }
    const res = await duplicateRoute(req(`/api/admin/pages/${id}/duplicate`), { params: Promise.resolve({ id }) })
    expect(res.status).toBe(401)
    expect((await db.query('select count(*)::int as n from cms_pages')).rows[0]).toEqual({ n: 1 })
  })
})

describe('admin page list', () => {
  it('returns every page when there are 500 or fewer, and flags the list as cut off above that', async () => {
    await db.exec(`do $$ begin for i in 1..500 loop perform cms_create_page('P' || i, 'p' || i, null, '[]'::jsonb, null, null, null, null, true, false, null); end loop; end $$`)
    const full = await listPagesPage()
    expect(full.items).toHaveLength(500)
    expect(full.truncated).toBe(false)
    await create('p501')
    const cut = await listPagesPage()
    expect(cut.items).toHaveLength(500)
    expect(cut.truncated).toBe(true)
    expect(await listPages()).toHaveLength(500)
  })

  it('requires an admin', async () => {
    state.auth = { authenticated: false, authorized: false, user: null, role: null }
    const res = await listRoute(new NextRequest('http://localhost/api/admin/pages'))
    expect(res.status).toBe(401)
  })
})

describe('publishing', () => {
  it('lets a hidden (noindex) copy go live, since search engines skip it', async () => {
    const id = await create('denver', { seoTitle: 'Denver', seoDescription: 'd', publish: true })
    const copy = await duplicatePage(id, null)
    const res = await publish(copy, 1)
    expect(res.status).toBe(200)
  })

  it('blocks an indexable copy that still has no SEO fields, and keeps it a draft', async () => {
    const id = await create('denver', { seoTitle: 'Denver', seoDescription: 'd', publish: true })
    const copy = await duplicatePage(id, null)
    const r = await row(copy)
    // The admin unticks "hide from search engines" without writing anything else.
    await db.query(`select cms_save_draft($1, 1, $2, $3, null, '[]'::jsonb, null, null, null, null, false, null)`, [copy, r.title, r.path])
    const res = await publish(copy, 2)
    const body = await res.json()
    expect(res.status).toBe(400)
    const messages = body.issues.map((i: { message: string }) => i.message).join(' ')
    for (const part of ['SEO title', 'SEO description', '"Copy of" title', 'Ask search engines not to list this page']) expect(messages).toContain(part)
    expect((await row(copy)).status).toBe('draft')
  })

  it('blocks a renamed copy whose content is still identical to the live original', async () => {
    const id = await create('denver', { seoTitle: 'Denver', seoDescription: 'd', publish: true })
    const copy = await duplicatePage(id, null)
    const sections = (await draft(copy)).sections
    // New title, URL and SEO, but the content was never edited.
    await saveDraft(copy, 1, { title: 'Aurora', path: 'aurora', description: null, sections: sections as never, seoTitle: 'Aurora', seoDescription: 'a', ogImage: null, canonicalUrl: null, noindex: false }, null)
    const res = await publish(copy, 2)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/exactly the same content as the live page \/denver/)
    expect((await row(copy)).status).toBe('draft')
  })

  it('publishes a real page whose URL happens to end in -copy', async () => {
    await create('denver', { seoTitle: 'Denver', seoDescription: 'd', publish: true })
    const { rows } = await db.query<{ id: string }>(
      `select cms_create_page('Writing ad copy','resources/ad-copy',null,$1::jsonb,'Writing Ad Copy','How to brief a writer.',null,null,false,false,null) as id`,
      [JSON.stringify([hero('Writing ad copy')])]
    )
    const res = await publish(rows[0].id, 1)
    expect(res.status).toBe(200)
  })

  it('publishes the copy once it has its own title, URL and SEO fields', async () => {
    const id = await create('plumbing/water-heater-repair', { seoTitle: 'Water Heater Repair', seoDescription: 'd', publish: true })
    const copy = await duplicatePage(id, null)
    await saveDraft(copy, 1, { title: 'Water Heater Repair in Denver', path: 'plumbing/water-heater-repair/denver', description: null, sections: [], seoTitle: 'Water Heater Repair in Denver, CO', seoDescription: 'Local help in Denver.', ogImage: null, canonicalUrl: null, noindex: false }, null)
    const res = await publish(copy, 2)
    expect(res.status).toBe(200)
    expect((await row(copy)).status).toBe('published')
  })

  it('blocks an SEO title that another live page already uses', async () => {
    await create('denver', { seoTitle: 'Plumbing in Denver', seoDescription: 'd', publish: true })
    const id = await create('denver-2', { title: 'Second', seoTitle: '  plumbing in DENVER ', seoDescription: 'd' })
    const res = await publish(id, 1)
    expect(res.status).toBe(400)
    const messages = (await res.json()).issues.map((i: { message: string }) => i.message)
    expect(messages).toContain('Another live page already uses this SEO title. Give this page its own title.')
  })

  it('rejects a URL that another live page already uses (unique index)', async () => {
    await create('hvac/ac-repair/denver')
    const other = await create('hvac/ac-repair/boulder')
    await expect(
      saveDraft(other, 1, { title: 'x', path: 'hvac/ac-repair/denver', description: null, sections: [], seoTitle: null, seoDescription: null, ogImage: null, canonicalUrl: null, noindex: true }, null)
    ).rejects.toMatchObject({ code: 'path_taken' } satisfies Partial<CmsError>)
  })

  it('refuses a stale version instead of publishing unchecked content', async () => {
    const id = await create('denver', { seoTitle: 'Denver', seoDescription: 'd' })
    const res = await publish(id, 7)
    expect(res.status).toBe(409)
    expect((await row(id)).status).toBe('draft')
  })

  it('only lets signed-in admins publish, and only from this site', async () => {
    const id = await create('denver', { seoTitle: 'Denver', seoDescription: 'd' })
    state.auth = { authenticated: true, authorized: false, user: { id: 'x' }, role: 'customer' }
    expect((await publish(id, 1)).status).toBe(403)
    state.auth = { authenticated: false, authorized: false, user: null, role: null }
    expect((await publish(id, 1)).status).toBe(401)
    state.auth = { ...ADMIN }
    expect((await publish(id, 1, 'https://evil.example')).status).toBe(403)
    expect((await row(id)).status).toBe('draft')
  })
})

afterAll(async () => {
  await db?.close()
})
