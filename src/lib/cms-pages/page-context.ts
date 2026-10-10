import type { Crumb, PageContext, PageKind } from '@/components/cms/sections'
import { PHOTOS } from '@/lib/media/photos'
import { pathToUrl } from './paths'

/** Home, city hub, service (plumbing/hvac/commercial ke neeche) ya baaki koi page. */
export function pageKind(path: string): PageKind {
  if (path === '') return 'home'
  if (path === 'denver' || path === 'boulder') return 'location'
  if (/^(plumbing|hvac|commercial)\/./.test(path)) return 'service'
  return 'page'
}

/** Every ancestor of a path, nearest last: 'a/b/c' -> ['a', 'a/b']. */
export function ancestorPaths(path: string): string[] {
  const parts = path.split('/').filter(Boolean)
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'))
}

/**
 * Breadcrumbs: Home, phir sirf woh ancestors jo live hain (draft ka link kabhi nahi),
 * aur aakhri item current page (bina link).
 */
export function buildCrumbs(path: string, title: string, liveTitles: Map<string, string>): Crumb[] {
  if (path === '') return []
  const crumbs: Crumb[] = [{ label: 'Home', href: '/' }]
  for (const p of ancestorPaths(path)) {
    const t = liveTitles.get(p)
    if (t) crumbs.push({ label: t, href: pathToUrl(p) })
  }
  crumbs.push({ label: title })
  return crumbs
}

export function buildPageContext(path: string, title: string, liveTitles: Map<string, string>): PageContext {
  const kind = pageKind(path)
  const cityPhoto = path === 'denver' ? PHOTOS.denverStreet : path === 'boulder' ? PHOTOS.boulderMeadow : undefined
  return { kind, crumbs: buildCrumbs(path, title, liveTitles), cityPhoto }
}

/** schema.org BreadcrumbList for the same trail, with absolute URLs. */
export function breadcrumbJsonLd(crumbs: Crumb[], baseUrl: string, currentUrl: string) {
  if (crumbs.length < 2) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.href ? `${baseUrl}${c.href === '/' ? '' : c.href}` : currentUrl,
    })),
  }
}

/**
 * schema.org Service for a service page. Sirf wahi facts jo page par dikhte hain:
 * service ka naam, description, Denver aur Boulder, aur business ka naam. Koi rating,
 * price, address ya hours nahi (woh business ne confirm nahi kiye).
 */
export function serviceJsonLd(opts: { name: string; description: string | null; url: string; providerName: string; baseUrl: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: opts.url,
    areaServed: [
      { '@type': 'City', name: 'Denver', containedInPlace: { '@type': 'State', name: 'Colorado' } },
      { '@type': 'City', name: 'Boulder', containedInPlace: { '@type': 'State', name: 'Colorado' } },
    ],
    provider: { '@type': 'Organization', name: opts.providerName, url: opts.baseUrl },
  }
}
