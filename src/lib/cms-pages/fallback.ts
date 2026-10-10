import 'server-only'
import { createHash } from 'node:crypto'
import { seedPages } from '../../../supabase/seed/pages'
import type { PublicPage } from './repository'

/**
 * The launch pages, served straight from code. They keep the site working
 * while the database is unreachable or its CMS tables have not been created
 * yet, so a missing migration shows the real site, not an error page. Once the
 * database answers, it is the only source and edits in the admin take over.
 */
function stableUuid(seed: string): string {
  const h = createHash('sha1').update(`pipeflow-seed:${seed}`).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`
}

export function getFallbackPage(path: string): PublicPage | null {
  const page = seedPages.find((p) => p.path === path && !p.draft && !p.isTemplate)
  if (!page) return null
  return {
    id: stableUuid(`page:${page.path}`),
    path: page.path,
    publishedAt: null,
    title: page.title,
    description: page.description ?? null,
    sections: page.sections.map((s, i) => ({ id: stableUuid(`${page.path}#${i}`), ...s })),
    seoTitle: page.seoTitle ?? null,
    seoDescription: page.seoDescription ?? null,
    ogImage: null,
    canonicalUrl: null,
    noindex: Boolean(page.noindex),
  }
}

export function getFallbackPaths() {
  return seedPages
    .filter((p) => !p.draft && !p.isTemplate)
    .map((p) => ({ path: p.path, updatedAt: new Date().toISOString(), noindex: Boolean(p.noindex) }))
}
