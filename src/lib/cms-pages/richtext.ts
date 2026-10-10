import { z } from 'zod'
import { isSafeHref } from './links'

/**
 * Rich text is stored as Tiptap/ProseMirror JSON and rendered by our own
 * server renderer, never as HTML. Only the nodes and marks below survive:
 * anything else is dropped on save and again on render, so a tampered request
 * cannot smuggle markup or script into the public site.
 */
export interface RichTextMark {
  type: 'bold' | 'italic' | 'link'
  attrs?: { href?: string }
}
export interface RichTextNode {
  type: string
  attrs?: { level?: number }
  content?: RichTextNode[]
  text?: string
  marks?: RichTextMark[]
}
export interface RichTextDoc {
  type: 'doc'
  content: RichTextNode[]
}

const BLOCKS = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote'])
const MAX_DEPTH = 8
const MAX_NODES = 2000

export const emptyRichText = (): RichTextDoc => ({ type: 'doc', content: [{ type: 'paragraph' }] })

function cleanMarks(marks: unknown): RichTextMark[] | undefined {
  if (!Array.isArray(marks)) return undefined
  const out: RichTextMark[] = []
  for (const m of marks) {
    if (!m || typeof m !== 'object') continue
    const type = (m as { type?: unknown }).type
    if (type === 'bold' || type === 'italic') out.push({ type })
    else if (type === 'link') {
      const href = (m as { attrs?: { href?: unknown } }).attrs?.href
      if (typeof href === 'string' && isSafeHref(href.trim())) out.push({ type: 'link', attrs: { href: href.trim() } })
    }
  }
  return out.length ? out : undefined
}

export function sanitizeRichText(input: unknown): RichTextDoc {
  let count = 0
  function clean(node: unknown, depth: number): RichTextNode | null {
    if (!node || typeof node !== 'object' || depth > MAX_DEPTH || ++count > MAX_NODES) return null
    const n = node as Record<string, unknown>
    const type = n.type
    if (type === 'text') {
      if (typeof n.text !== 'string' || n.text === '') return null
      const marks = cleanMarks(n.marks)
      return marks ? { type: 'text', text: n.text.slice(0, 20000), marks } : { type: 'text', text: n.text.slice(0, 20000) }
    }
    if (type === 'hardBreak') return { type: 'hardBreak' }
    if (typeof type !== 'string' || !BLOCKS.has(type)) return null
    const out: RichTextNode = { type }
    if (type === 'heading') {
      const level = (n.attrs as { level?: unknown } | undefined)?.level
      out.attrs = { level: level === 3 || level === 4 ? level : 2 }
    }
    if (Array.isArray(n.content)) {
      const children = n.content.map((c) => clean(c, depth + 1)).filter((c): c is RichTextNode => c !== null)
      if (children.length) out.content = children
    }
    return out
  }
  const root = (input && typeof input === 'object' ? (input as { content?: unknown }).content : null) ?? []
  const content = Array.isArray(root)
    ? root.map((c) => clean(c, 1)).filter((c): c is RichTextNode => c !== null)
    : []
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

// Anything goes in; a cleaned document always comes out (missing becomes an empty paragraph).
export const richTextSchema = z.unknown().transform((doc) => sanitizeRichText(doc))

/** Plain-text view, used for meta descriptions and "is this empty" checks. */
export function richTextToPlainText(doc: RichTextDoc): string {
  const parts: string[] = []
  const walk = (n: RichTextNode) => {
    if (n.type === 'text' && n.text) parts.push(n.text)
    n.content?.forEach(walk)
    if (BLOCKS.has(n.type) || n.type === 'hardBreak') parts.push(' ')
  }
  doc.content.forEach(walk)
  return parts.join('').replace(/\s+/g, ' ').trim()
}
