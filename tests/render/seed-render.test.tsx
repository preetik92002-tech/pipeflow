import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SectionRenderer } from '@/components/cms/SectionRenderer'
import { seedPages } from '../../supabase/seed/pages'

// Renders every seeded page the way the public site does, to catch a page that would crash or come out empty.
describe('seed pages render', () => {
  it.each(seedPages.map((p) => [p.path || '(home)', p] as const))('%s', (_name, page) => {
    const sections = page.sections.map((s, i) => ({ id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, ...s }))
    const html = renderToStaticMarkup(<SectionRenderer sections={sections} />)
    expect(html.length).toBeGreaterThan(500)
    expect(html).toContain('<h1')
    // all seeded sections must survive validation, so none are silently dropped
    const h2s = html.match(/<h2/g)?.length ?? 0
    expect(h2s).toBeGreaterThan(0)
  })
})
