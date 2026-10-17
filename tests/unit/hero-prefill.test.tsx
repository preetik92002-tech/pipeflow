import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { toPrefill } from '@/lib/requests/prefill'
import { SERVICES, isServiceZip, requestSchema } from '@/lib/requests/schema'
import { CompanyMarketingCta } from '@/components/cms/sections'

describe('shared ZIP rule', () => {
  it('accepts 80xxx only, and the request schema agrees', () => {
    for (const z of ['80202', ' 80302 ']) expect(isServiceZip(z)).toBe(true)
    for (const z of ['', '8020', '802022', '90210', 'abcde', '80 20']) expect(isServiceZip(z)).toBe(false)
    const base = { zip: '90210' } as never
    expect(requestSchema.safeParse(base).success).toBe(false)
  })
})

describe('hero link into /book-service', () => {
  const params = new URLSearchParams({ category: 'hvac', service: 'ac-repair', zip: '80202', type: 'business' })
  it('round-trips service, ZIP and property type through the prefill', () => {
    const p = toPrefill(Object.fromEntries(new URLSearchParams(params.toString())))
    expect(p).toMatchObject({ category: 'hvac', service: 'ac-repair', zip: '80202', customerType: 'business' })
  })
  it('ignores a ZIP the flow would reject', () => {
    expect(toPrefill({ zip: '90210' }).zip).toBeUndefined()
  })
  it('every hero option is a service the catalog supports', () => {
    for (const c of ['plumbing', 'hvac'] as const) expect(SERVICES[c].length).toBeGreaterThan(0)
  })
})

describe('company marketing CTA', () => {
  it('sends both buttons to /for-contractors', () => {
    const html = renderToStaticMarkup(<CompanyMarketingCta />)
    expect(html.match(/href="\/for-contractors"/g)?.length).toBe(2)
    expect(html).not.toContain('/join-us')
    expect(html).toContain('View Marketing Services')
    expect(html).toContain('Request a Marketing Consultation')
  })
})
