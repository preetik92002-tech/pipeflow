import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'

const dir = path.join(__dirname, '../../supabase/migrations')
const read = (f: string) => readFileSync(path.join(dir, f), 'utf8')
const SCHEMA = read('20261009000000_cms_pages.sql')
const MIGRATION = read('20261011000000_city_service_urls_and_water_heater_ctas.sql')

const OLD_TO_NEW: [string, string][] = [
  ['water/water-heater-repair/denver', 'plumbing/water-heater-repair/denver'],
  ['water/water-heater-repair/boulder', 'plumbing/water-heater-repair/boulder'],
  ['water/water-heater-replacement/denver', 'plumbing/water-heater-replacement/denver'],
  ['water/water-heater-replacement/boulder', 'plumbing/water-heater-replacement/boulder'],
  ['frozen/frozen-pipe-repair/denver', 'plumbing/frozen-pipe-repair/denver'],
  ['frozen/frozen-pipe-repair/boulder', 'plumbing/frozen-pipe-repair/boulder'],
  ['ac/ac-repair/denver', 'hvac/ac-repair/denver'],
  ['ac/ac-repair/boulder', 'hvac/ac-repair/boulder'],
]
const OLD = '/book-service?category=plumbing&service=water-heater-repair'
const REPLACEMENT = '/book-service?category=plumbing&service=water-heater-replacement'
const INSTALLATION = '/book-service?category=plumbing&service=water-heater-installation'
const COMMERCIAL = '/book-service?category=plumbing&type=business'
const btn = (label: string, href = OLD) => ({ label, href, variant: 'primary' })
const block = (heading: string, button: unknown) => ({ id: crypto.randomUUID(), type: 'contentBlock', data: { heading, button } })

/** The water heater page as the original seed created it. */
const seededButtons = () => [
  block('Repair', btn('Request Water Heater Repair')),
  block('Replacement', btn('Get Water Heater Replacement Help')),
  block('Installation', btn('Request Water Heater Installation')),
  block('Commercial', btn('Request Commercial Water Heater Service')),
  { id: crypto.randomUUID(), type: 'comparison', data: { buttons: [btn('Explore Water Heater Installation Options')] } },
]

async function freshDb() {
  const db = new PGlite()
  await db.exec(SCHEMA)
  return db
}
async function create(db: PGlite, p: string, sections: unknown[] = []) {
  const { rows } = await db.query<{ id: string }>(`select cms_create_page('t',$1,null,$2::jsonb,'s','d',null,null,false,false,null) as id`, [p, JSON.stringify(sections)])
  return rows[0].id
}
const publish = (db: PGlite, id: string, version: number) => db.query('select cms_publish($1, $2, null)', [id, version])
const pathOf = async (db: PGlite, id: string) => (await db.query<{ path: string }>('select path from cms_pages where id = $1', [id])).rows[0].path
/** Every button on the page as "label -> href". */
function buttons(sections: unknown): string[] {
  const out: string[] = []
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      if (typeof o.label === 'string' && typeof o.href === 'string') out.push(`${o.label} -> ${o.href}`)
      else Object.values(o).forEach(walk)
    }
  }
  walk(sections)
  return out
}
async function waterHeater(db: PGlite) {
  const { rows } = await db.query<{ id: string; version: number; draft_revision_id: string; published_revision_id: string; draft: unknown; live: unknown; revisions: number }>(`
    select p.id, p.version, p.draft_revision_id, p.published_revision_id, d.sections as draft, l.sections as live,
      (select count(*)::int from cms_page_revisions r where r.page_id = p.id) as revisions
    from cms_pages p join cms_page_revisions d on d.id = p.draft_revision_id left join cms_page_revisions l on l.id = p.published_revision_id
    where p.path = 'plumbing/water-heater-repair'`)
  return rows[0]
}

describe('city/service URL moves', () => {
  let db: PGlite
  const ids: Record<string, string> = {}
  beforeAll(async () => {
    db = await freshDb()
    for (const [oldPath] of OLD_TO_NEW) ids[oldPath] = await create(db, oldPath)
    // A legacy page that has already been published must not be moved silently.
    ids.published = await create(db, 'ac/ac-installation/boulder')
    await publish(db, ids.published, 1)
    // A legacy draft whose new address is already taken is left alone (no duplicate).
    ids.blocked = await create(db, 'ac/ac-installation/denver')
    ids.taken = await create(db, 'hvac/ac-installation/denver')
    // A deleted legacy page stays deleted and unmoved.
    ids.deleted = await create(db, 'water/water-heater-repair/elsewhere')
    await db.query('select cms_delete_page($1, null)', [ids.deleted])
    await db.exec(MIGRATION)
  })

  it('moves every never-published legacy draft to /<trade>/<service>/<city>', async () => {
    for (const [oldPath, newPath] of OLD_TO_NEW) expect(await pathOf(db, ids[oldPath])).toBe(newPath)
  })

  it('records each move in the audit log and creates no redirects (the pages were never public)', async () => {
    const moves = await db.query<{ n: number }>(`select count(*)::int as n from cms_audit_log where action = 'page.move'`)
    expect(moves.rows[0].n).toBe(OLD_TO_NEW.length)
    expect((await db.query('select * from cms_redirects')).rows).toEqual([])
  })

  it('leaves published, deleted and blocked pages where they are', async () => {
    expect(await pathOf(db, ids.published)).toBe('ac/ac-installation/boulder')
    expect(await pathOf(db, ids.blocked)).toBe('ac/ac-installation/denver')
    expect(await pathOf(db, ids.taken)).toBe('hvac/ac-installation/denver')
    expect(await pathOf(db, ids.deleted)).toBe('water/water-heater-repair/elsewhere')
  })

  it('never creates a duplicate page', async () => {
    const dup = await db.query(`select path, count(*) from cms_pages where deleted_at is null group by path having count(*) > 1`)
    expect(dup.rows).toEqual([])
  })

  it('is safe to run again: nothing moves twice', async () => {
    const before = await db.query('select id, path, version, draft_revision_id from cms_pages order by id')
    await db.exec(MIGRATION)
    expect((await db.query('select id, path, version, draft_revision_id from cms_pages order by id')).rows).toEqual(before.rows)
  })
})

describe('water heater CTAs when the draft and live versions match', () => {
  let db: PGlite
  let before: Awaited<ReturnType<typeof waterHeater>>
  beforeAll(async () => {
    db = await freshDb()
    const id = await create(db, 'plumbing/water-heater-repair', [
      ...seededButtons(),
      // The admin changed this link but kept the label: it must stay as the admin left it.
      block('Edited link', btn('Get Water Heater Replacement Help', '/book-service?category=plumbing&service=water-heater-replacement&urgency=today')),
      block('Edited link 2', btn('Request Water Heater Installation', '/contact')),
      // The admin changed this label but kept the original link: also left alone.
      block('Edited label', btn('Book an installer')),
    ])
    await publish(db, id, 1)
    before = await waterHeater(db)
    await db.exec(MIGRATION)
  })

  it('points each original button at its own service', async () => {
    expect(buttons((await waterHeater(db)).draft).slice(0, 5)).toEqual([
      `Request Water Heater Repair -> ${OLD}`,
      `Get Water Heater Replacement Help -> ${REPLACEMENT}`,
      `Request Water Heater Installation -> ${INSTALLATION}`,
      `Request Commercial Water Heater Service -> ${COMMERCIAL}`,
      `Explore Water Heater Installation Options -> ${INSTALLATION}`,
    ])
  })

  it('leaves buttons whose link or label an admin edited exactly as they were', async () => {
    expect(buttons((await waterHeater(db)).draft).slice(5)).toEqual([
      'Get Water Heater Replacement Help -> /book-service?category=plumbing&service=water-heater-replacement&urgency=today',
      'Request Water Heater Installation -> /contact',
      `Book an installer -> ${OLD}`,
    ])
  })

  it('puts the change in one new draft and leaves the live version untouched', async () => {
    const after = await waterHeater(db)
    expect(after.published_revision_id).toBe(before.published_revision_id)
    expect(after.live).toEqual(before.live)
    expect(after.draft_revision_id).not.toBe(before.draft_revision_id)
    expect(after.revisions).toBe(before.revisions + 1)
  })

  it('is safe to run again: no second revision', async () => {
    const first = await waterHeater(db)
    await db.exec(MIGRATION)
    const second = await waterHeater(db)
    expect(second.revisions).toBe(first.revisions)
    expect(second.version).toBe(first.version)
  })
})

describe('water heater CTAs: content outside the buttons', () => {
  it('keeps every other field, section and button exactly as it was', async () => {
    const db = await freshDb()
    const other = [
      { id: 'no-data', type: 'spacer' },
      { id: 'string-data', type: 'odd', data: 'x' },
      { id: 'null-button', type: 'contentBlock', data: { heading: 'H', button: null, content: { type: 'doc', content: [{ type: 'text', text: 'Get Water Heater Replacement Help' }] } } },
      { id: 'hero', type: 'hero', data: { heading: 'Water heaters', image: '/art/water-heater.svg', buttons: [btn('Request Water Heater Installation'), btn('Find a Local Plumber', '/plumbing')] } },
      { id: 'cards', type: 'featureCards', data: { cards: [{ title: 'Get Water Heater Replacement Help', href: OLD, image: '' }] } },
    ]
    const id = await create(db, 'plumbing/water-heater-repair', other)
    await publish(db, id, 1)
    const before = (await waterHeater(db)).draft as typeof other
    await db.exec(MIGRATION)
    const after = (await waterHeater(db)).draft as typeof other
    const expected = structuredClone(before)
    ;(expected[3].data as { buttons: { href: string }[] }).buttons[0].href = INSTALLATION
    expect(after).toEqual(expected)
  })

  it('records what it changed in the audit log', async () => {
    const db = await freshDb()
    const id = await create(db, 'plumbing/water-heater-repair', seededButtons())
    await publish(db, id, 1)
    await db.exec(MIGRATION)
    await db.exec(MIGRATION)
    const log = await db.query<{ action: string; meta: { buttons_changed: number } }>(`select action, meta from cms_audit_log where action like 'migration.%'`)
    expect(log.rows).toHaveLength(1)
    expect(log.rows[0]).toMatchObject({ action: 'migration.water_heater_ctas.applied', meta: { buttons_changed: 4 } })
  })
})

describe('water heater CTAs when the page is in an unexpected state', () => {
  async function skippedFor(setup: (db: PGlite, id: string) => Promise<void>) {
    const db = await freshDb()
    const id = await create(db, 'plumbing/water-heater-repair', seededButtons())
    await setup(db, id)
    const before = await db.query('select * from cms_page_revisions order by id')
    await db.exec(MIGRATION)
    await db.exec(MIGRATION)
    expect((await db.query('select * from cms_page_revisions order by id')).rows).toEqual(before.rows)
    return (await db.query<{ meta: { reason: string } }>(`select meta from cms_audit_log where action = 'migration.water_heater_ctas.skipped'`)).rows
  }

  it('skips an unpublished page and logs why, once', async () => {
    const log = await skippedFor(async (db, id) => {
      await publish(db, id, 1)
      await db.query('select cms_unpublish($1, 2, null)', [id])
    })
    expect(log).toHaveLength(1)
    expect(log[0].meta.reason).toBe('page is not published')
  })

  it('skips a deleted page without logging against it', async () => {
    const log = await skippedFor(async (db, id) => {
      await publish(db, id, 1)
      await db.query('select cms_delete_page($1, null)', [id])
    })
    expect(log).toEqual([])
  })
})

describe('water heater CTAs when the page has unpublished edits', () => {
  it('logs the skip once per draft version', async () => {
    const db = await freshDb()
    const id = await create(db, 'plumbing/water-heater-repair', seededButtons())
    await publish(db, id, 1)
    await db.query(`select cms_save_draft($1, 2, 't', 'plumbing/water-heater-repair', null, '[]'::jsonb, 's', 'd', null, null, false, null)`, [id])
    await db.exec(MIGRATION)
    await db.exec(MIGRATION)
    const log = await db.query<{ meta: { reason: string } }>(`select meta from cms_audit_log where action = 'migration.water_heater_ctas.skipped'`)
    expect(log.rows).toHaveLength(1)
    expect(log.rows[0].meta.reason).toMatch(/unpublished changes/)
  })

  it('changes nothing, so the edits cannot go live unreviewed', async () => {
    const db = await freshDb()
    const id = await create(db, 'plumbing/water-heater-repair', seededButtons())
    await publish(db, id, 1)
    // The admin saved a draft and has not published it yet.
    const edited = [...seededButtons(), block('New section', null)]
    await db.query(`select cms_save_draft($1, 2, 't', 'plumbing/water-heater-repair', null, $2::jsonb, 's', 'd', null, null, false, null)`, [id, JSON.stringify(edited)])
    const before = await waterHeater(db)
    expect(before.draft_revision_id).not.toBe(before.published_revision_id)

    await db.exec(MIGRATION)
    const after = await waterHeater(db)
    expect(after).toEqual(before)
    expect(buttons(after.draft).every((b) => b.endsWith(OLD))).toBe(true)
  })

  it('changes nothing on a page that has never been published', async () => {
    const db = await freshDb()
    await create(db, 'plumbing/water-heater-repair', seededButtons())
    const before = await waterHeater(db)
    await db.exec(MIGRATION)
    expect(await waterHeater(db)).toEqual(before)
  })
})

/**
 * Runs a SQL file one top-level statement at a time and stops at the first error, the way
 * psql -f and statement-splitting SQL editors do. (Sending the whole file as one string is
 * already atomic in Postgres, so it would not show whether BEGIN/COMMIT are there.)
 */
async function runStatementByStatement(db: PGlite, sql: string) {
  const statements: string[] = []
  let current = ''
  let inBody = false
  for (const line of sql.split(/\r?\n/)) {
    if (!inBody && /^\s*--/.test(line)) continue
    current += line + '\n'
    if ((line.match(/\$\$/g) ?? []).length % 2 === 1) inBody = !inBody
    if (!inBody && /;\s*$/.test(line)) {
      statements.push(current.trim())
      current = ''
    }
  }
  for (const s of statements) await db.exec(s)
}

describe('transaction', () => {
  async function failingSetup() {
    const db = await freshDb()
    const moved = await create(db, 'ac/ac-repair/denver')
    const wh = await create(db, 'plumbing/water-heater-repair', seededButtons())
    await publish(db, wh, 1)
    // Make the second step fail half way through the file.
    await db.exec('drop function cms_save_draft(UUID, INT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN, UUID)')
    return { db, moved }
  }

  it('rolls back the URL moves too if a later step fails, even when run statement by statement', async () => {
    const { db, moved } = await failingSetup()
    await expect(runStatementByStatement(db, MIGRATION)).rejects.toThrow(/cms_save_draft/)
    await db.exec('ROLLBACK')
    expect(await pathOf(db, moved)).toBe('ac/ac-repair/denver')
    expect((await db.query(`select * from cms_audit_log where action = 'page.move'`)).rows).toEqual([])
  })

  it('needs its BEGIN/COMMIT for that: without them the first step would already be saved', async () => {
    const { db, moved } = await failingSetup()
    const bare = MIGRATION.replace(/^BEGIN;\s*$/m, '').replace(/^SET LOCAL .*$/m, '').replace(/^COMMIT;\s*$/m, '')
    await expect(runStatementByStatement(db, bare)).rejects.toThrow(/cms_save_draft/)
    expect(await pathOf(db, moved)).toBe('hvac/ac-repair/denver')
  })

  it('starts with BEGIN and ends with COMMIT', () => {
    const code = MIGRATION.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('--'))
    expect(code[0]).toBe('BEGIN;')
    expect(code[code.length - 1]).toBe('COMMIT;')
  })
})
