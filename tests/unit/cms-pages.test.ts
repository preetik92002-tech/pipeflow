import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { isSafeHref } from '@/lib/cms-pages/links'
import { classifyPath, pathSchema, slugify, splitPath, validatePath } from '@/lib/cms-pages/paths'
import { contentKey, isCopyTitle, NOINDEX_LABEL, publishProblems } from '@/lib/cms-pages/publish-checks'
import { filterPages, summarize } from '@/lib/cms-pages/page-list'
import { richTextToPlainText, sanitizeRichText } from '@/lib/cms-pages/richtext'
import { SECTION_TYPES, dataSchemas } from '@/lib/cms-pages/sections/registry'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'

const uuid = () => crypto.randomUUID()

describe('links', () => {
  it.each(['/denver', '/plumbing/water-heater-repair', 'https://example.com/a', 'mailto:a@b.co', 'tel:+17205550100'])(
    'allows %s',
    (v) => expect(isSafeHref(v)).toBe(true)
  )
  it.each(['javascript:alert(1)', 'data:text/html,<b>', '//evil.com', 'http://example.com', 'denver', '/\\evil.com', 'vbscript:x', ' javascript:alert(1)'])(
    'blocks %s',
    (v) => expect(isSafeHref(v)).toBe(false)
  )
})

describe('paths', () => {
  it('accepts nested multi-segment paths and the homepage', () => {
    expect(validatePath('plumbing/water-heater-repair')).toBeNull()
    expect(validatePath('our-services')).toBeNull()
    expect(validatePath('', { allowHome: true })).toBeNull()
  })
  it.each(['Admin', 'admin', 'admin/users', 'api/x', 'sitemap.xml', 'blog/post', 'Our Services', 'a/b/c/d/e', 'a--b', ''])(
    'rejects %j',
    (v) => expect(validatePath(v)).not.toBeNull()
  )
  it('normalises slashes and rejects reserved paths through the schema', () => {
    expect(pathSchema.parse('/hvac/ac-repair/')).toBe('hvac/ac-repair')
    expect(pathSchema.safeParse('/admin').success).toBe(false)
  })
  it('slugifies titles', () => {
    expect(slugify('AC Repair Services in Denver & Boulder')).toBe('ac-repair-services-in-denver-and-boulder')
    expect(slugify('  Crème  brûlée!! ')).toBe('creme-brulee')
  })
  it('splits a path into parent and slug', () => {
    expect(splitPath('plumbing/water-heater-repair')).toEqual({ parent: 'plumbing', slug: 'water-heater-repair' })
    expect(splitPath('denver')).toEqual({ parent: '', slug: 'denver' })
  })
  it('accepts every city/service URL', () => {
    for (const p of ['plumbing/plumbing-repair', 'plumbing/water-heater-repair', 'plumbing/frozen-pipe-repair', 'hvac/ac-repair', 'hvac/ac-installation']) {
      for (const city of ['denver', 'boulder']) expect(validatePath(`${p}/${city}`), `${p}/${city}`).toBeNull()
    }
  })
  it('reads the service category and city from the URL', () => {
    expect(classifyPath('plumbing/water-heater-repair/denver')).toEqual({ category: 'plumbing', location: 'denver' })
    expect(classifyPath('hvac/ac-installation/boulder')).toEqual({ category: 'hvac', location: 'boulder' })
    expect(classifyPath('hvac/ac-repair')).toEqual({ category: 'hvac', location: null })
    expect(classifyPath('commercial/plumbing')).toEqual({ category: 'plumbing', location: null })
    expect(classifyPath('denver')).toEqual({ category: null, location: 'denver' })
    expect(classifyPath('')).toEqual({ category: null, location: null })
    expect(classifyPath('resources/what-to-do-when-a-pipe-freezes')).toEqual({ category: null, location: null })
  })
})

describe('admin page list', () => {
  const row = (path: string, status = 'published', isTemplate = false) => ({ path, status, isTemplate })
  const items = [
    row('plumbing/water-heater-repair'), row('plumbing/water-heater-repair/denver', 'draft'), row('hvac/ac-repair/boulder', 'draft'),
    row('denver'), row('commercial/hvac'), row('about'), row('service-page-template', 'draft', true),
  ]
  it('filters by category and city from the URL', () => {
    expect(filterPages(items, { category: 'plumbing', location: 'all' }).map((i) => i.path)).toEqual(['plumbing/water-heater-repair', 'plumbing/water-heater-repair/denver'])
    expect(filterPages(items, { category: 'all', location: 'denver' }).map((i) => i.path)).toEqual(['plumbing/water-heater-repair/denver', 'denver'])
    expect(filterPages(items, { category: 'hvac', location: 'boulder' }).map((i) => i.path)).toEqual(['hvac/ac-repair/boulder'])
    expect(filterPages(items, { category: 'all', location: 'all' })).toHaveLength(items.length)
  })
  it('counts only the rows shown, never templates', () => {
    expect(summarize(items, { filtered: false, truncated: false, limit: 500 })).toBe('6 pages · 4 published · 2 drafts')
    const denver = filterPages(items, { category: 'all', location: 'denver' })
    expect(summarize(denver, { filtered: true, truncated: false, limit: 500 })).toBe('2 matching pages · 1 published · 1 draft')
  })
  it('says when the list was cut off', () => {
    expect(summarize(items, { filtered: false, truncated: true, limit: 500 })).toMatch(/showing the 500 most recently changed; search to find others$/)
  })
})

describe('publish checks', () => {
  const hero = (heading: string, id = crypto.randomUUID()) => ({ id, type: 'hero', data: { heading, buttons: [{ label: 'Go', href: '/book-service', variant: 'primary' }] } })
  const liveSections = [hero('Water Heater Repair'), hero('FAQ')]
  const page = { id: 'p1', path: 'plumbing/water-heater-repair/denver', title: 'Water Heater Repair in Denver', seoTitle: 'Water Heater Repair in Denver, CO', seoDescription: 'Local help.', noindex: false, sections: [hero('Water Heater Repair in Denver')] }
  const others = [{ id: 'p2', path: 'plumbing/water-heater-repair', seoTitle: 'Water Heater Repair, Replacement & Installation Denver & Boulder', noindex: false, contentKey: contentKey(liveSections) }]

  it('lets a finished indexable page go live', () => {
    expect(publishProblems(page, others)).toEqual([])
  })
  it('needs an SEO title and description on indexable pages only', () => {
    expect(publishProblems({ ...page, seoTitle: ' ', seoDescription: null }, others)).toHaveLength(2)
    expect(publishProblems({ ...page, seoTitle: null, seoDescription: null, noindex: true }, others)).toEqual([])
  })
  it('names the real editor checkbox in its messages', () => {
    const messages = publishProblems({ ...page, seoTitle: null, seoDescription: null, title: 'Copy of X', sections: liveSections }, others)
    expect(messages).toHaveLength(4)
    for (const m of messages) expect(m).toContain(`tick "${NOINDEX_LABEL}"`)
    expect(NOINDEX_LABEL).toBe('Ask search engines not to list this page')
    expect(readFileSync(path.join(__dirname, '../../src/components/admin/pages/PageEditor.tsx'), 'utf8')).toContain('{NOINDEX_LABEL}')
  })
  it('blocks a copy that still has its "Copy of" title', () => {
    expect(publishProblems({ ...page, title: 'Copy of Water Heater Repair' }, others).join()).toMatch(/"Copy of" title/)
    expect(isCopyTitle('Copywriting services')).toBe(false)
  })
  it('blocks a page whose content is identical to a live page, whatever its section ids', () => {
    const copy = { ...page, sections: liveSections.map((s) => ({ ...s, id: crypto.randomUUID() })) }
    expect(publishProblems(copy, others).join()).toMatch(/exactly the same content as the live page \/plumbing\/water-heater-repair/)
    // Same content is fine when the other page is hidden from search, or when this one is.
    expect(publishProblems(copy, [{ ...others[0], noindex: true }])).toEqual([])
    expect(publishProblems({ ...copy, noindex: true }, others)).toEqual([])
    // One edited word is enough to count as its own page.
    const edited = { ...copy, sections: [hero('Water Heater Repair in Denver'), hero('FAQ')] }
    expect(publishProblems(edited, others)).toEqual([])
  })
  it('allows real URLs that end in -copy or -copy-<number>', () => {
    for (const p of ['resources/ad-copy', 'resources/website-copy-2024', 'services/carbon-copy', 'plumbing/water-heater-repair-copy-2']) {
      expect(publishProblems({ ...page, path: p }, others), p).toEqual([])
    }
  })
  it('ignores empty pages when comparing content', () => {
    expect(contentKey([])).toBe('')
    expect(publishProblems({ ...page, sections: [] }, [{ ...others[0], contentKey: '' }])).toEqual([])
  })
  it('compares content regardless of key order', () => {
    expect(contentKey([{ id: 'a', type: 'x', data: { b: 1, a: 2 } }])).toBe(contentKey([{ data: { a: 2, b: 1 }, type: 'x', id: 'b' }]))
  })
  it('blocks an SEO title already used by another live indexable page', () => {
    const same = { ...page, seoTitle: 'water heater repair, replacement & installation  denver & boulder' }
    expect(publishProblems(same, others).join()).toMatch(/already uses this SEO title/)
    expect(publishProblems(same, [{ ...others[0], noindex: true }])).toEqual([])
    expect(publishProblems({ ...page, id: 'p2' }, [{ ...others[0], seoTitle: page.seoTitle }])).toEqual([])
  })
  it('blocks a URL another live page uses', () => {
    expect(publishProblems(page, [{ id: 'p9', path: page.path, seoTitle: 'x', noindex: true, contentKey: '' }]).join()).toMatch(/already uses this URL/)
  })
})

describe('rich text sanitising', () => {
  it('keeps allowed nodes and marks', () => {
    const doc = sanitizeRichText({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Hi' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'bold' }, { type: 'link', attrs: { href: '/denver' } }] }] },
      ],
    })
    expect(doc.content[0]).toEqual({ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Hi' }] })
    expect(doc.content[1].content?.[0].marks).toEqual([{ type: 'bold' }, { type: 'link', attrs: { href: '/denver' } }])
  })
  it('drops script-like links, unknown nodes and unknown marks', () => {
    const doc = sanitizeRichText({
      type: 'doc',
      content: [
        { type: 'script', content: [{ type: 'text', text: 'alert(1)' }] },
        { type: 'image', attrs: { src: 'x' } },
        { type: 'paragraph', content: [{ type: 'text', text: 'click', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }, { type: 'onclick' }] }] },
      ],
    })
    expect(JSON.stringify(doc)).not.toMatch(/script|javascript|image|onclick/)
    expect(richTextToPlainText(doc)).toBe('click')
  })
  it('clamps heading levels and survives garbage', () => {
    const doc = sanitizeRichText({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'A' }] }] })
    expect(doc.content[0].attrs?.level).toBe(2)
    for (const bad of [null, undefined, 'x', 5, [], { content: 'no' }]) {
      expect(sanitizeRichText(bad)).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] })
    }
  })
  it('limits nesting depth', () => {
    let node: unknown = { type: 'text', text: 'deep' }
    for (let i = 0; i < 30; i++) node = { type: 'blockquote', content: [node] }
    expect(richTextToPlainText(sanitizeRichText({ type: 'doc', content: [node] }))).toBe('')
  })
})

describe('section schemas', () => {
  it('every registered type has valid defaults', () => {
    for (const meta of SECTION_TYPES) {
      const result = sectionsSchema.safeParse([{ id: uuid(), type: meta.type, data: meta.defaults() }])
      expect(result.success, `${meta.type}: ${JSON.stringify(result.error?.issues)}`).toBe(true)
    }
  })
  it('every type in the schema is in the registry', () => {
    expect(Object.keys(dataSchemas).sort()).toEqual(SECTION_TYPES.map((s) => s.type).sort())
  })
  it('rejects unknown types and unsafe button links', () => {
    expect(sectionsSchema.safeParse([{ id: uuid(), type: 'script', data: {} }]).success).toBe(false)
    const hero = { id: uuid(), type: 'hero', data: { heading: 'H', buttons: [{ label: 'Go', href: 'javascript:alert(1)' }] } }
    expect(sectionsSchema.safeParse([hero]).success).toBe(false)
  })
  it('allows at most two hero buttons and requires a heading', () => {
    const b = { label: 'Go', href: '/x' }
    expect(sectionsSchema.safeParse([{ id: uuid(), type: 'hero', data: { heading: 'H', buttons: [b, b, b] } }]).success).toBe(false)
    expect(sectionsSchema.safeParse([{ id: uuid(), type: 'hero', data: { heading: '' } }]).success).toBe(false)
  })
  it('sanitises rich text during validation', () => {
    const r = sectionsSchema.parse([
      { id: uuid(), type: 'richText', data: { content: { type: 'doc', content: [{ type: 'script' }, { type: 'paragraph', content: [{ type: 'text', text: 'ok' }] }] } } },
    ])
    expect(JSON.stringify(r)).not.toContain('script')
  })
})
