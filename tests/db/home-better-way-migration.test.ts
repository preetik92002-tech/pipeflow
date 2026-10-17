import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, describe, expect, it } from 'vitest'

const dir = path.join(__dirname, '../../supabase/migrations')
const read = (f: string) => readFileSync(path.join(dir, f), 'utf8')
const MIGRATION = read('20261012000000_remove_home_better_way_section.sql')
const TITLES = ['Local Options', 'Easy Service Requests', 'Photo Uploads', 'Convenient Scheduling', 'Residential & Commercial Support', 'Clear Professional Profiles']
const cards = (heading: string, titles: string[]) => ({ id: crypto.randomUUID(), type: 'featureCards', data: { heading, intro: '', cards: titles.map((title) => ({ title, text: '', href: '', image: '' })) } })
const betterWay = () => cards('A Better Way to Find Plumbing & HVAC Help', TITLES)
const other = () => cards('Serving Denver & Boulder', ['Denver', 'Boulder'])

const open: PGlite[] = []
afterAll(async () => { await Promise.all(open.splice(0).map((d) => d.close())) })

async function setup(sections: unknown[], p = '') {
  const db = new PGlite()
  open.push(db)
  await db.exec(read('20261009000000_cms_pages.sql'))
  const { rows } = await db.query<{ id: string }>(`select cms_create_page('Home',$1,null,$2::jsonb,'s','d',null,null,false,false,null) as id`, [p, JSON.stringify(sections)])
  const { rows: v } = await db.query<{ version: number }>('select version from cms_pages where id = $1', [rows[0].id])
  await db.query('select cms_publish($1, $2, null)', [rows[0].id, v[0].version])
  return { db, id: rows[0].id }
}
const headings = async (db: PGlite, revisionOf: 'draft' | 'published', id: string) => {
  const col = revisionOf === 'draft' ? 'draft_revision_id' : 'published_revision_id'
  const { rows } = await db.query<{ sections: { data: { heading: string } }[] }>(`select r.sections from cms_pages p join cms_page_revisions r on r.id = p.${col} where p.id = $1`, [id])
  return rows[0].sections.map((s) => s.data.heading)
}

describe('home "A Better Way" migration', () => {
  it('drops only that section into a new draft, keeps order, leaves the live page alone, and is re-runnable', async () => {
    const { db, id } = await setup([other(), betterWay(), cards('Last', ['x'])])
    await db.exec(MIGRATION)
    expect(await headings(db, 'draft', id)).toEqual(['Serving Denver & Boulder', 'Last'])
    expect(await headings(db, 'published', id)).toEqual(['Serving Denver & Boulder', 'A Better Way to Find Plumbing & HVAC Help', 'Last'])
    await db.exec(MIGRATION)
    const { rows } = await db.query<{ n: string }>('select count(*) n from cms_page_revisions where page_id = $1', [id])
    expect(Number(rows[0].n)).toBe(2)
  })
  it('leaves a section with the same heading but different cards, and other pages, untouched', async () => {
    const edited = cards('A Better Way to Find Plumbing & HVAC Help', ['Something else'])
    const home = await setup([edited])
    await home.db.exec(MIGRATION)
    expect(await headings(home.db, 'draft', home.id)).toEqual(['A Better Way to Find Plumbing & HVAC Help'])
    const about = await setup([betterWay()], 'about')
    await about.db.exec(MIGRATION)
    expect(await headings(about.db, 'draft', about.id)).toHaveLength(1)
  })
  it('skips a home page that has unpublished edits', async () => {
    const { db, id } = await setup([betterWay()])
    const { rows } = await db.query<{ version: number }>('select version from cms_pages where id = $1', [id])
    await db.query(`select cms_save_draft($1,$2,'Home','',null,$3::jsonb,null,null,null,null,false,null)`, [id, rows[0].version, JSON.stringify([betterWay(), other()])])
    await db.exec(MIGRATION)
    expect(await headings(db, 'draft', id)).toHaveLength(2)
  })
})
