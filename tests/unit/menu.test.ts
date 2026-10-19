import { describe, expect, it } from 'vitest'
import { buildMenu, footerColumns } from '@/lib/cms-pages/menu'
import { DEFAULT_NAVIGATION, type Navigation } from '@/lib/cms-pages/navigation-schema'

describe('main menu built from the admin-managed navigation', () => {
  const menu = buildMenu(DEFAULT_NAVIGATION)

  it('keeps every header destination and adds no link that is not in the stored navigation', () => {
    const stored = new Set([...DEFAULT_NAVIGATION.header, ...DEFAULT_NAVIGATION.footerServices, ...DEFAULT_NAVIGATION.footerAreas, ...DEFAULT_NAVIGATION.footerCompany, ...DEFAULT_NAVIGATION.footerResources].map((l) => l.href))
    const shown = menu.flatMap((m) => [m.href, ...m.children.map((c) => c.href)])
    for (const href of shown) expect(stored.has(href), href).toBe(true)
    for (const h of DEFAULT_NAVIGATION.header.filter((l) => l.href !== '/')) expect(shown, h.href).toContain(h.href)
  })

  it('gives Plumbing and HVAC dropdowns of the pages under them, and groups the areas', () => {
    const by = (label: string) => menu.find((m) => m.label === label)!
    expect(by('Plumbing').children.every((c) => c.href.startsWith('/plumbing/'))).toBe(true)
    expect(by('Plumbing').children.length).toBeGreaterThan(0)
    expect(by('HVAC').children.every((c) => c.href.startsWith('/hvac/'))).toBe(true)
    expect(by('Service Areas').children.map((c) => c.href)).toEqual(['/denver', '/boulder'])
    expect(menu.some((m) => m.href === '/')).toBe(false)
    expect(buildMenu(DEFAULT_NAVIGATION, { includeHome: true })[0].href).toBe('/')
  })

  it('works for any navigation an admin saves, without dropdowns when nothing lives below a link', () => {
    const nav: Navigation = { ...DEFAULT_NAVIGATION, header: [{ label: 'About', href: '/about' }, { label: 'Denver', href: '/denver' }] }
    const m = buildMenu(nav)
    expect(m).toEqual([{ label: 'About', href: '/about', children: [] }, { label: 'Denver', href: '/denver', children: [] }])
  })

  it('groups footer links by topic and drops empty groups', () => {
    const cols = footerColumns(DEFAULT_NAVIGATION)
    expect(cols.map((c) => c.title)).toEqual(['Plumbing', 'HVAC', 'Service Areas', 'Company'])
    expect(cols.flatMap((c) => c.links).length).toBe(DEFAULT_NAVIGATION.footerServices.length + DEFAULT_NAVIGATION.footerAreas.length + DEFAULT_NAVIGATION.footerCompany.length + DEFAULT_NAVIGATION.footerResources.length)
  })
})
