import type { Navigation, NavLink } from './navigation-schema'

/** One entry of the public main menu: a link, optionally with a dropdown of child links. */
export interface MenuItem {
  label: string
  href: string
  children: NavLink[]
}

const isChildOf = (parent: string, href: string) => parent !== '/' && href.startsWith(`${parent}/`)

/**
 * Builds the main menu from the menus an admin edits in Admin > Navigation. Nothing is hard-coded:
 * - a header link gets a dropdown of the footer links that live under its path (Plumbing -> /plumbing/...);
 * - header links that are also footer "areas" (Denver, Boulder) are grouped under one "Service Areas" item.
 * Every destination comes from the stored navigation, so no link can point at a page that is not in it.
 */
export function buildMenu(nav: Navigation, { includeHome = false }: { includeHome?: boolean } = {}): MenuItem[] {
  const footer = [...nav.footerServices, ...nav.footerAreas, ...nav.footerCompany, ...nav.footerResources]
  const areaHrefs = new Set(nav.footerAreas.map((l) => l.href))
  const items: MenuItem[] = []
  let areas: MenuItem | null = null
  for (const link of nav.header) {
    if (link.href === '/' && !includeHome) continue
    if (areaHrefs.has(link.href)) {
      if (!areas) {
        areas = { label: 'Service Areas', href: link.href, children: [] }
        items.push(areas)
      }
      areas.children.push({ label: link.label, href: link.href })
      continue
    }
    const seen = new Set<string>()
    const children = footer.filter((l) => isChildOf(link.href, l.href) && !seen.has(l.href) && seen.add(l.href))
    items.push({ label: link.label, href: link.href, children })
  }
  // A single area needs no dropdown: show it as a plain link.
  if (areas && areas.children.length === 1) Object.assign(areas, { label: areas.children[0].label, children: [] })
  return items
}

/** Footer columns, grouped by topic from the same admin-managed lists. */
export function footerColumns(nav: Navigation): { title: string; links: NavLink[] }[] {
  const plumbing = nav.footerServices.filter((l) => l.href.startsWith('/plumbing'))
  const hvac = nav.footerServices.filter((l) => l.href.startsWith('/hvac'))
  const other = nav.footerServices.filter((l) => !plumbing.includes(l) && !hvac.includes(l))
  return [
    { title: 'Plumbing', links: plumbing },
    { title: 'HVAC', links: hvac },
    { title: 'Services', links: other },
    { title: 'Service Areas', links: nav.footerAreas },
    { title: 'Company', links: [...nav.footerCompany, ...nav.footerResources] },
  ].filter((c) => c.links.length > 0)
}
