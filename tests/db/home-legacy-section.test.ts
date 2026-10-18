import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { pgliteSupabase } from '../helpers/pglite-supabase'

// The home page still stores the legacy "A Better Way to Find Plumbing & HVAC Help" grid in production. The live site hides it;
// the admin preview must show what is really stored (and say so), so a removal draft can be verified by looking at the preview.
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://pipeflowco.com')
const state = vi.hoisted(() => ({ client: null as unknown }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => state.client }))
vi.mock('@/lib/supabase/auth', () => ({ verifyAdminAuth: async () => ({ authenticated: true, authorized: true, user: { id: 'a' }, role: 'super_admin' }) }))
vi.mock('@/lib/cms/queries', () => ({ getPublishedBlogs: async () => [], getActiveReviews: async () => ({ items: [], count: 0, average: null }) }))

import CmsPage from '@/app/(site)/[[...path]]/page'
import PreviewPage from '@/app/(site)/preview/[id]/page'

const HEADING = 'A Better Way to Find Plumbing & HVAC Help'
const TITLES = ['Local Options', 'Easy Service Requests', 'Photo Uploads', 'Convenient Scheduling', 'Residential & Commercial Support', 'Clear Professional Profiles']
const cards = (heading: string, titles: string[]) => ({ id: crypto.randomUUID(), type: 'featureCards', data: { heading, intro: '', cards: titles.map((title) => ({ title, text: '', href: '', image: '' })) } })
const hero = (heading: string) => ({ id: crypto.randomUUID(), type: 'hero', data: { eyebrow: '', heading, subtitle: 'Subtitle', intro: '', image: '', buttons: [{ label: 'Request Service', href: '/book-service', variant: 'primary' }], align: 'left' } })
const legacyGrid = () => cards(HEADING, TITLES)
const otherGrid = () => cards('Serving Denver & Boulder', ['Denver', 'Boulder'])

const dir = path.join(__dirname, '../../supabase/migrations')
let db: PGlite
let homeId = ''
let aboutId = ''

const textOf = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/\s+/g, ' ')
const params = (p: string) => ({ params: Promise.resolve({ path: p === '' ? undefined : p.split('/') }) })
const live = async (p: string) => textOf(renderToStaticMarkup((await CmsPage(params(p))) as ReactElement))
const preview = async (id: string) => textOf(renderToStaticMarkup((await PreviewPage({ params: Promise.resolve({ id }) })) as ReactElement))
const sectionHeadings = async (revision: 'draft' | 'published', id: string) => {
  const col = revision === 'draft' ? 'draft_revision_id' : 'published_revision_id'
  const { rows } = await db.query<{ sections: { data: { heading: string } }[] }>(`select r.sections from cms_pages p join cms_page_revisions r on r.id = p.${col} where p.id = $1`, [id])
  return rows[0].sections.map((s) => s.data.heading)
}
async function createPublished(pagePath: string, title: string, sections: unknown[]) {
  const { rows } = await db.query<{ id: string }>(`select cms_create_page($1,$2,null,$3::jsonb,'Title','Description',null,null,false,false,null) as id`, [title, pagePath, JSON.stringify(sections)])
  await db.query('select cms_publish($1, 1, null)', [rows[0].id])
  return rows[0].id
}

beforeAll(async () => {
  db = new PGlite()
  await db.exec(readFileSync(path.join(dir, '20261009000000_cms_pages.sql'), 'utf8'))
  state.client = pgliteSupabase(db)
  homeId = await createPublished('', 'Home', [hero('Trusted Plumbing & HVAC Services'), otherGrid(), legacyGrid()])
  aboutId = await createPublished('about', 'About', [hero(HEADING)])
})
afterAll(async () => {
  await db?.close()
})

describe('legacy "A Better Way" grid on the home page', () => {
  it('is stored in both the draft and the published revision', async () => {
    expect(await sectionHeadings('draft', homeId)).toContain(HEADING)
    expect(await sectionHeadings('published', homeId)).toContain(HEADING)
  })

  it('is hidden on the live home page while the other sections still render', async () => {
    const text = await live('')
    expect(text).not.toContain(HEADING)
    expect(text).not.toContain('Photo Uploads')
    expect(text).toContain('Serving Denver & Boulder')
  })

  it('does not touch the same heading on /about', async () => {
    expect(await live('about')).toContain(HEADING)
    expect(await preview(aboutId)).toContain(HEADING)
  })

  it('shows in the admin preview, with a notice that visitors do not see it', async () => {
    const text = await preview(homeId)
    expect(text).toContain(HEADING)
    expect(text).toContain('Photo Uploads')
    expect(text).toContain('the live home page hides it')
  })

  it('shows a card grid with edited titles to visitors, because it is no longer the legacy grid', async () => {
    const id = await createPublished('edited-home-check', 'Edited', [cards(HEADING, ['Local Options', 'Edited title'])])
    expect(await live('edited-home-check')).toContain('Edited title')
    expect(id).toBeTruthy()
  })
})

describe('removing the grid through a draft', () => {
  it('the preview reflects the new draft while the published revision and live page stay as they were', async () => {
    const { rows } = await db.query<{ version: number }>('select version from cms_pages where id = $1', [homeId])
    const withoutGrid = [hero('Trusted Plumbing & HVAC Services'), otherGrid()]
    await db.query(`select cms_save_draft($1,$2,'Home','',null,$3::jsonb,'Title','Description',null,null,false,null)`, [homeId, rows[0].version, JSON.stringify(withoutGrid)])

    // Stored state, checked directly in the database: the draft lost the section, the published revision still has it.
    expect(await sectionHeadings('draft', homeId)).not.toContain(HEADING)
    expect(await sectionHeadings('published', homeId)).toContain(HEADING)

    const previewText = await preview(homeId)
    expect(previewText).not.toContain(HEADING)
    expect(previewText).not.toContain('the live home page hides it')

    // The live page is unchanged: the published revision is untouched and the renderer still hides the grid.
    expect(await live('')).not.toContain(HEADING)
  })
})
