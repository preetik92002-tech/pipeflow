import type { Section, SectionData } from '@/lib/cms-pages/sections/schema'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'
import {
  HeroSection, RichTextSection, ContentBlockSection, ContentBlockGroup, GallerySection, FeatureCardsSection, ComparisonSection,
  StepsSection, FaqSection, CtaSection, TestimonialsSection, LinkListSection, ContactInfoSection, SpacerSection,
  type PageContext, type Tone,
} from './sections'

const DEFAULT_CTX: PageContext = { kind: 'page', crumbs: [] }

/** Chhota, bina list/image wala content block — aise 2+ lagataar blocks ek row mein dikhte hain. */
export function isShortBlock(section: Section): section is Extract<Section, { type: 'contentBlock' }> {
  if (section.type !== 'contentBlock') return false
  const d = section.data
  if (d.image && d.imagePosition !== 'none') return false
  if (/^\d{1,2}$/.test(d.label)) return false
  const json = JSON.stringify(d.content)
  return json.length < 500 && !json.includes('"bulletList"') && !json.includes('"orderedList"')
}

type Item = { kind: 'one'; section: Section; index: number } | { kind: 'group'; id: string; blocks: SectionData<'contentBlock'>[] }

/** Sections ko render units mein badalta hai: short content blocks ki lagataar run ek group ban jaati hai. */
export function layoutSections(sections: Section[]): Item[] {
  const items: Item[] = []
  for (let i = 0; i < sections.length; i++) {
    if (isShortBlock(sections[i]) && i + 1 < sections.length && isShortBlock(sections[i + 1])) {
      const run: Extract<Section, { type: 'contentBlock' }>[] = []
      while (i < sections.length && run.length < 3 && isShortBlock(sections[i])) run.push(sections[i++] as Extract<Section, { type: 'contentBlock' }>)
      i--
      items.push({ kind: 'group', id: run[0].id, blocks: run.map((s) => s.data) })
    } else {
      items.push({ kind: 'one', section: sections[i], index: i })
    }
  }
  return items
}

const isDark = (s: Section) => s.type === 'hero' || s.type === 'steps' || (s.type === 'cta' && s.data.tone === 'dark') || s.type === 'spacer'

function renderSection(section: Section, index: number, tone: Tone, ctx: PageContext) {
  switch (section.type) {
    case 'hero': return <HeroSection data={section.data} first={index === 0} ctx={ctx} />
    case 'richText': return <RichTextSection data={section.data} tone={tone} />
    case 'contentBlock': return <ContentBlockSection data={section.data} tone={tone} />
    case 'gallery': return <GallerySection data={section.data} tone={tone} />
    case 'featureCards': return <FeatureCardsSection data={section.data} tone={tone} />
    case 'comparison': return <ComparisonSection data={section.data} tone={tone} />
    case 'steps': return <StepsSection data={section.data} />
    case 'faq': return <FaqSection data={section.data} tone={tone} />
    case 'cta': return <CtaSection data={section.data} tone={tone} />
    case 'testimonials': return <TestimonialsSection data={section.data} tone={tone} />
    case 'linkList': return <LinkListSection data={section.data} tone={tone} ctx={ctx} />
    case 'contactInfo': return <ContactInfoSection data={section.data} tone={tone} />
    case 'spacer': return <SpacerSection data={section.data} />
  }
}

/**
 * Validates stored sections and renders each as a Server Component. A section
 * that fails validation is skipped on the public site instead of breaking the page.
 * Light sections alternate white and paper backgrounds so long pages have a rhythm.
 */
export function SectionRenderer({ sections, ctx = DEFAULT_CTX }: { sections: unknown; ctx?: PageContext }) {
  const list = Array.isArray(sections) ? sections : []
  const valid: Section[] = []
  for (const raw of list) {
    const parsed = sectionsSchema.element.safeParse(raw)
    if (parsed.success) valid.push(parsed.data)
  }
  // Split hero paper par hota hai, isliye uske baad pehla light section white se shuru.
  let light = 0
  const nextTone = (): Tone => (light++ % 2 === 0 ? 'white' : 'paper')
  return (
    <>
      {layoutSections(valid).map((item) => {
        if (item.kind === 'group') return <div key={item.id}><ContentBlockGroup blocks={item.blocks} tone={nextTone()} /></div>
        const tone = isDark(item.section) ? 'white' : nextTone()
        return <div key={item.section.id}>{renderSection(item.section, item.index, tone, ctx)}</div>
      })}
    </>
  )
}
