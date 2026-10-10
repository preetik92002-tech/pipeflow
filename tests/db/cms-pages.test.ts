import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Runs the real migration against an in-process Postgres so constraints,
// the partial unique index and the transactional functions are tested for real.
const migration = readFileSync(
  path.join(__dirname, '../../supabase/migrations/20261009000000_cms_pages.sql'),
  'utf8'
)
const USER = '00000000-0000-0000-0000-000000000001'

let db: PGlite

async function createPage(pagePath: string, title = 'A page', sections: unknown[] = []) {
  const res = await db.query<{ id: string }>(
    `select cms_create_page($1,$2,null,$3::jsonb,null,null,null,null,false,false,$4) as id`,
    [title, pagePath, JSON.stringify(sections), USER]
  )
  return res.rows[0].id
}

async function page(id: string) {
  const res = await db.query<Record<string, unknown>>('select * from cms_pages where id = $1', [id])
  return res.rows[0]
}

function save(id: string, version: number, title: string, pagePath: string, sections: unknown[] = []) {
  return db.query<{ v: number }>(
    `select cms_save_draft($1,$2,$3,$4,null,$5::jsonb,null,null,null,null,false,$6) as v`,
    [id, version, title, pagePath, JSON.stringify(sections), USER]
  )
}

beforeAll(async () => {
  db = new PGlite()
  await db.exec(migration)
})

beforeEach(async () => {
  await db.exec('truncate cms_redirects, cms_audit_log, cms_page_revisions, cms_pages restart identity cascade')
})

describe('cms_pages schema', () => {
  it('creates a draft page with a first revision', async () => {
    const id = await createPage('hvac/ac-repair', 'AC Repair', [{ type: 'spacer' }])
    const p = await page(id)
    expect(p.status).toBe('draft')
    expect(p.version).toBe(1)
    expect(p.published_revision_id).toBeNull()
    const revs = await db.query('select number, sections from cms_page_revisions where page_id = $1', [id])
    expect(revs.rows).toHaveLength(1)
  })

  it('rejects a duplicate path among live pages', async () => {
    await createPage('our-services')
    await expect(createPage('our-services')).rejects.toThrow(/unique|duplicate/i)
  })

  it('frees the path after a soft delete', async () => {
    const id = await createPage('our-services')
    await db.query('select cms_delete_page($1,$2)', [id, USER])
    await expect(createPage('our-services')).resolves.toBeTruthy()
  })

  it.each(['Our-Services', '/our-services', 'our services', 'a//b', 'a/b/c/d/e', 'x'.repeat(201), '-a'])(
    'rejects the invalid path %j',
    async (bad) => {
      await expect(createPage(bad)).rejects.toThrow(/check/i)
    }
  )

  it('allows the empty path for the homepage and nested paths up to four segments', async () => {
    await expect(createPage('')).resolves.toBeTruthy()
    await expect(createPage('a/b/c/d')).resolves.toBeTruthy()
  })
})

describe('save, publish and concurrency', () => {
  it('saving a draft never changes the published revision', async () => {
    const id = await createPage('denver', 'Denver', [{ type: 'spacer', v: 1 }])
    await db.query('select cms_publish($1,1,$2)', [id, USER])
    const live = (await page(id)).published_revision_id

    await save(id, 2, 'Denver edited', 'denver', [{ type: 'spacer', v: 2 }])
    const p = await page(id)
    expect(p.published_revision_id).toBe(live)
    expect(p.draft_revision_id).not.toBe(live)
    expect(p.status).toBe('published')
  })

  it('publishing makes the latest draft live', async () => {
    const id = await createPage('denver')
    await save(id, 1, 'New title', 'denver')
    await db.query('select cms_publish($1,2,$2)', [id, USER])
    const p = await page(id)
    expect(p.status).toBe('published')
    expect(p.published_revision_id).toBe(p.draft_revision_id)
    expect(p.published_at).not.toBeNull()
  })

  it('rejects a save from a stale version instead of overwriting', async () => {
    const id = await createPage('denver')
    await save(id, 1, 'First editor', 'denver')
    await expect(save(id, 1, 'Second editor', 'denver')).rejects.toThrow(/version_conflict/)
    const t = await db.query<{ title: string }>('select title from cms_pages where id = $1', [id])
    expect(t.rows[0].title).toBe('First editor')
  })

  it('rejects publish and unpublish from a stale version', async () => {
    const id = await createPage('denver')
    await save(id, 1, 'Edit', 'denver')
    await expect(db.query('select cms_publish($1,1,$2)', [id, USER])).rejects.toThrow(/version_conflict/)
    await expect(db.query('select cms_unpublish($1,1,$2)', [id, USER])).rejects.toThrow(/version_conflict/)
  })

  it('unpublish keeps content and marks the page unpublished', async () => {
    const id = await createPage('denver')
    await db.query('select cms_publish($1,1,$2)', [id, USER])
    await db.query('select cms_unpublish($1,2,$2)', [id, USER])
    const p = await page(id)
    expect(p.status).toBe('unpublished')
    expect(p.published_revision_id).not.toBeNull()
  })

  it('will not publish a template page', async () => {
    const res = await db.query<{ id: string }>(
      `select cms_create_page('Template','service-template',null,'[]'::jsonb,null,null,null,null,false,true,$1) as id`,
      [USER]
    )
    await expect(db.query('select cms_publish($1,1,$2)', [res.rows[0].id, USER])).rejects.toThrow(
      /template_not_publishable/
    )
  })

  it('writes an audit entry for each action', async () => {
    const id = await createPage('denver')
    await save(id, 1, 'Edit', 'denver')
    await db.query('select cms_publish($1,2,$2)', [id, USER])
    const log = await db.query<{ action: string }>(
      'select action from cms_audit_log where entity_id = $1 order by id',
      [id]
    )
    expect(log.rows.map((r) => r.action)).toEqual(['page.create', 'page.save_draft', 'page.publish'])
  })
})

describe('path changes and redirects', () => {
  it('leaves a redirect when a published page moves', async () => {
    const id = await createPage('water-heater')
    await db.query('select cms_publish($1,1,$2)', [id, USER])
    await save(id, 2, 'Water heater', 'plumbing/water-heater-repair')
    const r = await db.query<{ from_path: string; to_path: string }>('select from_path, to_path from cms_redirects')
    expect(r.rows).toEqual([{ from_path: 'water-heater', to_path: 'plumbing/water-heater-repair' }])
  })

  it('does not create a redirect for a page that was never published', async () => {
    const id = await createPage('water-heater')
    await save(id, 1, 'Water heater', 'plumbing/water-heater-repair')
    const r = await db.query('select * from cms_redirects')
    expect(r.rows).toHaveLength(0)
  })

  it('collapses redirect chains', async () => {
    const id = await createPage('a')
    await db.query('select cms_publish($1,1,$2)', [id, USER])
    await save(id, 2, 'P', 'b')
    await save(id, 3, 'P', 'c')
    const r = await db.query<{ from_path: string; to_path: string }>(
      'select from_path, to_path from cms_redirects order by from_path'
    )
    expect(r.rows).toEqual([
      { from_path: 'a', to_path: 'c' },
      { from_path: 'b', to_path: 'c' },
    ])
  })

  it('removes a redirect when a live page takes its old path back', async () => {
    const id = await createPage('a')
    await db.query('select cms_publish($1,1,$2)', [id, USER])
    await save(id, 2, 'P', 'b')
    await save(id, 3, 'P', 'a')
    const r = await db.query<{ from_path: string; to_path: string }>('select from_path, to_path from cms_redirects')
    expect(r.rows).toEqual([{ from_path: 'b', to_path: 'a' }])
  })

  it('rejects moving onto a path another live page uses, and keeps the page unchanged', async () => {
    await createPage('taken')
    const id = await createPage('mine')
    await expect(save(id, 1, 'Mine', 'taken')).rejects.toThrow(/unique|duplicate/i)
    expect((await page(id)).path).toBe('mine')
    expect((await page(id)).version).toBe(1)
  })

  it('deleting a page removes redirects pointing at it', async () => {
    const id = await createPage('a')
    await db.query('select cms_publish($1,1,$2)', [id, USER])
    await save(id, 2, 'P', 'b')
    await db.query('select cms_delete_page($1,$2)', [id, USER])
    const r = await db.query('select * from cms_redirects')
    expect(r.rows).toHaveLength(0)
  })
})
