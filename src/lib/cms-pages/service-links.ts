import type { Crumb } from '@/components/cms/sections'
import { validatePath } from './paths'

/**
 * Helpers for pages built from the service templates (serviceCategory / serviceDetail sections). They look at the page's
 * content, not at its URL, so a service page behaves the same at /water-heater-repair and at /plumbing/water-heater-repair.
 */

type RawSection = { type?: unknown; data?: Record<string, unknown> }
type RawLink = { label?: unknown; href?: unknown }

const SERVICE_TYPES = ['serviceCategory', 'serviceDetail'] as const
export type ServiceTemplate = (typeof SERVICE_TYPES)[number]

const serviceSections = (sections: unknown): (RawSection & { type: ServiceTemplate })[] =>
  (Array.isArray(sections) ? sections : []).filter(
    (s): s is RawSection & { type: ServiceTemplate } => !!s && typeof s === 'object' && (SERVICE_TYPES as readonly unknown[]).includes((s as RawSection).type)
  )

/** Which service template a page uses, or null for an ordinary page. */
export function serviceTemplateOf(sections: unknown): ServiceTemplate | null {
  return serviceSections(sections)[0]?.type ?? null
}

const linksOf = (value: unknown): RawLink[] => (Array.isArray(value) ? (value.filter((v) => v && typeof v === 'object') as RawLink[]) : [])

/** The CMS page path an internal link points at ('/plumbing-services?x=1' -> 'plumbing-services'), or null for anything else. */
export function cmsPathOf(href: string): string | null {
  if (!href.startsWith('/') || href.startsWith('//')) return null
  const path = href.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '')
  return path !== '' && validatePath(path) === null ? path : null
}

/** Internal CMS pages linked from a service page's breadcrumbs, category cards and related list. */
export function linkedCmsPaths(sections: unknown): string[] {
  const found = new Set<string>()
  for (const s of serviceSections(sections)) {
    for (const key of ['breadcrumbs', 'cards', 'related']) {
      for (const link of linksOf(s.data?.[key])) {
        const path = typeof link.href === 'string' ? cmsPathOf(link.href) : null
        if (path) found.add(path)
      }
    }
  }
  return [...found]
}

/**
 * Whether a link may be shown. Without a set of live pages nothing is filtered. With one, a link to a CMS page that is not
 * live (a draft, unpublished or deleted page) is withheld so visitors never follow it to a 404.
 */
export function isLinkable(href: string, live?: ReadonlySet<string>): boolean {
  if (!live) return true
  const path = cmsPathOf(href)
  return path === null || live.has(`/${path}`)
}

/** The breadcrumb trail a service page shows, for structured data: live ancestors only, current page last without a link. */
export function serviceCrumbs(sections: unknown, live?: ReadonlySet<string>): Crumb[] | null {
  const section = serviceSections(sections)[0]
  const items = linksOf(section?.data?.breadcrumbs)
  if (!items.length) return null
  return items.flatMap((item, i): Crumb[] => {
    const label = typeof item.label === 'string' ? item.label : ''
    const href = typeof item.href === 'string' ? item.href : ''
    if (!label) return []
    if (i === items.length - 1) return [{ label }]
    return href && isLinkable(href, live) ? [{ label, href }] : []
  })
}
