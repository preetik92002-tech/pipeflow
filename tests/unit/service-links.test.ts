import { describe, expect, it } from 'vitest'
import { cmsPathOf, isLinkable, linkedCmsPaths, serviceCrumbs, serviceTemplateOf } from '@/lib/cms-pages/service-links'

const detail = (data: Record<string, unknown>) => [{ id: 'x', type: 'serviceDetail', data }]
const sections = detail({
  breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'HVAC Services', href: '/hvac-services' }, { label: 'AC Installation', href: '/ac-installation' }],
  related: [{ label: 'Denver', href: '/denver' }, { label: 'Request', href: '/book-service?category=hvac' }, { label: 'Site', href: 'https://example.com/x' }],
  cards: [{ title: 'AC', href: '/ac-services' }],
})

describe('service template helpers', () => {
  it('recognises the template from the content, not the URL', () => {
    expect(serviceTemplateOf(sections)).toBe('serviceDetail')
    expect(serviceTemplateOf([{ type: 'serviceCategory', data: {} }])).toBe('serviceCategory')
    expect(serviceTemplateOf([{ type: 'hero', data: {} }])).toBeNull()
    expect(serviceTemplateOf(undefined)).toBeNull()
    expect(serviceTemplateOf('nope')).toBeNull()
  })

  it('treats only real CMS page links as CMS paths', () => {
    expect(cmsPathOf('/hvac-services/')).toBe('hvac-services')
    expect(cmsPathOf('/plumbing/water-heater-repair#faq')).toBe('plumbing/water-heater-repair')
    for (const href of ['/', '/book-service?category=hvac', '/admin/pages', 'https://example.com/a', '//evil.example/a', 'relative']) expect(cmsPathOf(href), href).toBeNull()
  })

  it('lists the linked CMS pages once each', () => {
    expect(linkedCmsPaths(sections).sort()).toEqual(['ac-installation', 'ac-services', 'denver', 'hvac-services'])
    expect(linkedCmsPaths([{ type: 'hero', data: { buttons: [{ href: '/hvac' }] } }])).toEqual([])
  })

  it('filters nothing without a live set, and withholds only non-live CMS links with one', () => {
    expect(isLinkable('/ac-installation')).toBe(true)
    const live = new Set(['/denver'])
    expect(isLinkable('/denver', live)).toBe(true)
    expect(isLinkable('/ac-installation', live)).toBe(false)
    for (const href of ['/', '/book-service?category=hvac', 'https://example.com/x']) expect(isLinkable(href, live), href).toBe(true)
  })

  it('builds structured-data breadcrumbs from live ancestors, with the current page last and unlinked', () => {
    expect(serviceCrumbs(sections)).toEqual([{ label: 'Home', href: '/' }, { label: 'HVAC Services', href: '/hvac-services' }, { label: 'AC Installation' }])
    expect(serviceCrumbs(sections, new Set())).toEqual([{ label: 'Home', href: '/' }, { label: 'AC Installation' }])
    expect(serviceCrumbs([{ type: 'hero', data: {} }])).toBeNull()
  })
})
