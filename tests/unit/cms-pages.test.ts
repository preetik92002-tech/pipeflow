import { describe, expect, it } from 'vitest'
import { isSafeHref } from '@/lib/cms-pages/links'
import { pathSchema, slugify, splitPath, validatePath } from '@/lib/cms-pages/paths'
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
