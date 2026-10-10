/**
 * Checks run before a page goes live. Pure functions, so the rules are tested
 * without a database; the publish API supplies the page and the other live pages.
 */

import { sectionsSchema } from './sections/schema'

/** The editor's checkbox text. Error messages quote it, so both always match. */
export const NOINDEX_LABEL = 'Ask search engines not to list this page'

export interface PublishCandidate {
  id: string
  path: string
  title: string
  seoTitle: string | null
  seoDescription: string | null
  noindex: boolean
  sections: unknown
}

export interface LivePage {
  id: string
  path: string
  seoTitle: string | null
  noindex: boolean
  /** contentKey() of the published sections. */
  contentKey: string
}

/** Titles made by "Duplicate" start with "Copy of". */
export const isCopyTitle = (title: string) => /^copy of /i.test(title.trim())

/**
 * The page content without section ids, in a stable form. Duplicate sirf section ids badalta hai,
 * isliye bina edit ki copy ka key original jaisa hi hota hai. URL dekhkar andaza lagane se ye
 * zyada bharosemand hai: "/resources/ad-copy" jaisa asli URL ab galti se block nahi hota.
 */
export function contentKey(rawSections: unknown): string {
  if (!Array.isArray(rawSections) || rawSections.length === 0) return ''
  // Pehle schema se guzaaro: nayi fields (jaise imageAlt) ke defaults dono taraf barabar lagte hain,
  // warna purani saved JSON aur duplicate (jo parse hokar bani) alag dikhte aur copy pakdi nahi jaati.
  const parsed = sectionsSchema.safeParse(rawSections)
  const sections: unknown[] = parsed.success ? parsed.data : rawSections
  const stable = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(stable)
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, stable((v as Record<string, unknown>)[k])]))
    }
    return v
  }
  return JSON.stringify(sections.map((s) => {
    const { id: _id, ...rest } = (s ?? {}) as Record<string, unknown>
    return stable(rest)
  }))
}

const norm = (v: string | null) => (v ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
const url = (path: string) => (path === '' ? '/' : `/${path}`)

/** Returns the problems that block publishing; an empty list means it may go live. */
export function publishProblems(page: PublishCandidate, live: LivePage[]): string[] {
  const problems: string[] = []
  const others = live.filter((p) => p.id !== page.id)

  // Path unique hai ya nahi: database ka unique index har save par ye pakka karta hai,
  // phir bhi yahan check rakha hai taaki admin ko saaf message mile.
  if (others.some((p) => p.path === page.path)) {
    problems.push('Another live page already uses this URL. Change the URL before publishing.')
  }

  // noindex page search engines mein nahi aata, isliye uske liye SEO aur duplicate checks zaroori nahi.
  if (page.noindex) return problems
  const hide = `tick "${NOINDEX_LABEL}"`

  // Indexable page ke liye apna SEO title aur description zaroori hai. Duplicate karne par
  // ye fields khaali ho jaate hain, isliye bina likhe copy Google mein nahi ja sakti.
  if (!norm(page.seoTitle)) problems.push(`Add an SEO title before publishing, or ${hide}.`)
  if (!norm(page.seoDescription)) problems.push(`Add an SEO description before publishing, or ${hide}.`)

  // "Copy of ..." title ka matlab copy abhi rename nahi hui.
  if (isCopyTitle(page.title)) problems.push(`This page still has its "Copy of" title. Rename it, or ${hide}, before publishing.`)

  // Bilkul same content wala doosra live indexable page = duplicate content (adhuri copy ka sabse pakka sign).
  const key = contentKey(page.sections)
  const twin = key ? others.find((p) => !p.noindex && p.contentKey === key) : undefined
  if (twin) problems.push(`This page has exactly the same content as the live page ${url(twin.path)}. Change the content, or ${hide}, before publishing.`)

  // Do live indexable pages ka same SEO title search mein duplicate content jaisa dikhta hai.
  const title = norm(page.seoTitle)
  if (title && others.some((p) => !p.noindex && norm(p.seoTitle) === title)) {
    problems.push('Another live page already uses this SEO title. Give this page its own title.')
  }

  return problems
}
