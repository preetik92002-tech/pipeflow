import { describe, expect, it } from 'vitest'
import { DEFAULT_NAVIGATION, navigationSchema } from '@/lib/cms-pages/navigation-schema'
import { seedPages } from '../../supabase/seed/pages'
import { pathToUrl } from '@/lib/cms-pages/paths'

describe('navigation', () => {
  it('default menus are valid', () => {
    expect(navigationSchema.safeParse(DEFAULT_NAVIGATION).success).toBe(true)
  })

  it('rejects unsafe or empty links', () => {
    const bad = (href: string) => navigationSchema.safeParse({ ...DEFAULT_NAVIGATION, header: [{ label: 'X', href }] }).success
    expect(bad('javascript:alert(1)')).toBe(false)
    expect(bad('')).toBe(false)
    expect(bad('/plumbing')).toBe(true)
    expect(bad('https://example.com')).toBe(true)
  })

  it('limits the top menu to 8 links', () => {
    const header = Array.from({ length: 9 }, (_, i) => ({ label: `L${i}`, href: '/' }))
    expect(navigationSchema.safeParse({ ...DEFAULT_NAVIGATION, header }).success).toBe(false)
  })

  it('default links to CMS pages point at pages that are seeded', () => {
    const urls = new Set(seedPages.map((p) => pathToUrl(p.path)))
    const external = new Set(['/join-us', '/contact', '/blog', '/book-service'])
    const all = [...DEFAULT_NAVIGATION.header, ...DEFAULT_NAVIGATION.footerServices, ...DEFAULT_NAVIGATION.footerAreas, ...DEFAULT_NAVIGATION.footerCompany, ...DEFAULT_NAVIGATION.footerResources]
    for (const l of all) expect(urls.has(l.href) || external.has(l.href), l.href).toBe(true)
  })
})
