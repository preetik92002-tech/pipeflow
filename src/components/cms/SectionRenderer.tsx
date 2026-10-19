import type { Section, SectionData } from '@/lib/cms-pages/sections/schema'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'
import {
  HeroSection, RichTextSection, ContentBlockSection, ContentBlockGroup, GallerySection, FeatureCardsSection, ComparisonSection,
  StepsSection, FaqSection, CtaSection, TestimonialsSection, LinkListSection, ContactInfoSection, SpacerSection, ReviewsSection,
  type PageContext, type Tone,
} from './sections'
import { ServicePageTemplate } from '@/components/service-pages/ServicePageTemplate'
import { HomeLayout } from '@/components/home/HomeLayout'

const LEGACY_BETTER_WAY_CARDS = ['Local Options', 'Easy Service Requests', 'Photo Uploads', 'Convenient Scheduling', 'Residential & Commercial Support', 'Clear Professional Profiles'].join('|')
const DEFAULT_CTX: PageContext = { kind: 'page', crumbs: [] }

const isLegacyBetterWay = (s: Section) => s.type === 'featureCards' && s.data.cards.map((c) => c.title).join('|') === LEGACY_BETTER_WAY_CARDS

/**
 * True when the stored sections still hold the legacy "A Better Way to Find Plumbing & HVAC Help" grid. The live home page hides it
 * (see SectionRenderer), so the admin preview uses this to say the section is stored but not shown to visitors.
 */
export function hasLegacyBetterWay(sections: unknown): boolean {
  return (Array.isArray(sections) ? sections : []).some((raw) => {
    const parsed = sectionsSchema.element.safeParse(raw)
    return parsed.success && isLegacyBetterWay(parsed.data)
  })
}

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

/** A text-only content block (no image beside it): consecutive ones are shown side by side as cards. */
export function isTextBlock(section: Section): section is Extract<Section, { type: 'contentBlock' }> {
  return section.type === 'contentBlock' && !(section.data.image && section.data.imagePosition !== 'none')
}

/**
 * Sections ko render units mein badalta hai: consecutive text blocks (short ones, numbered steps like Repair /
 * Replacement / Installation, or long ones) become one row of up to three cards instead of a tall stack of sections.
 */
export function layoutSections(sections: Section[]): Item[] {
  const items: Item[] = []
  for (let i = 0; i < sections.length; i++) {
    if (isTextBlock(sections[i]) && i + 1 < sections.length && isTextBlock(sections[i + 1])) {
      const run: Extract<Section, { type: 'contentBlock' }>[] = []
      while (i < sections.length && run.length < 3 && isTextBlock(sections[i])) run.push(sections[i++] as Extract<Section, { type: 'contentBlock' }>)
      i--
      items.push({ kind: 'group', id: run[0].id, blocks: run.map((s) => s.data) })
    } else {
      items.push({ kind: 'one', section: sections[i], index: i })
    }
  }
  return items
}

const isDark = (s: Section) => s.type === 'hero' || (s.type === 'cta' && s.data.tone === 'dark') || s.type === 'spacer'

function renderSection(section: Section, index: number, tone: Tone, ctx: PageContext) {
  switch (section.type) {
    case 'hero': return <HeroSection data={section.data} first={index === 0} ctx={ctx} />
    case 'richText': return <RichTextSection data={section.data} tone={tone} />
    case 'contentBlock': return <ContentBlockSection data={section.data} tone={tone} />
    case 'gallery': return <GallerySection data={section.data} tone={tone} />
    case 'featureCards': return <FeatureCardsSection data={section.data} tone={tone} />
    case 'comparison': return <ComparisonSection data={section.data} tone={tone} />
    case 'steps': return <StepsSection data={section.data} ctx={ctx} tone={tone} />
    case 'faq': return <FaqSection data={section.data} tone={tone} />
    case 'cta': return <CtaSection data={section.data} tone={tone} />
    case 'testimonials': return <TestimonialsSection data={section.data} tone={tone} />
    case 'linkList': return <LinkListSection data={section.data} tone={tone} ctx={ctx} />
    case 'contactInfo': return <ContactInfoSection data={section.data} tone={tone} />
    case 'spacer': return <SpacerSection data={section.data} />
    case 'serviceCategory': return <ServicePageTemplate data={section.data} template="category" liveHrefs={ctx.liveHrefs} />
    case 'serviceDetail': return <ServicePageTemplate data={section.data} template="detail" liveHrefs={ctx.liveHrefs} />
  }
}

/**
 * Validates stored sections and renders each as a Server Component. A section
 * that fails validation is skipped on the public site instead of breaking the page.
 * Light sections alternate white and paper backgrounds so long pages have a rhythm.
 */
export function SectionRenderer({ sections, ctx = DEFAULT_CTX, showLegacy = false }: { sections: unknown; ctx?: PageContext; showLegacy?: boolean }) {
  const list = Array.isArray(sections) ? sections : []
  const valid: Section[] = []
  for (const raw of list) {
    const parsed = sectionsSchema.element.safeParse(raw)
    if (parsed.success) valid.push(parsed.data)
  }
  // Home page only. Stored homepages seeded before supabase/migrations/20261012000000_remove_home_better_way_section.sql
  // still hold the "A Better Way to Find Plumbing & HVAC Help" grid, so it is skipped by its six card titles (renaming the
  // heading does not bring it back). Delete this block once that migration has been run and the home page republished.
  // The admin preview passes showLegacy so it shows what is really stored; only the public page hides the grid.
  if (ctx.kind === 'home' && !showLegacy) {
    for (let i = valid.length - 1; i >= 0; i--) {
      if (isLegacyBetterWay(valid[i])) valid.splice(i, 1)
    }
  }
  // The same call-to-action never appears twice on a page, and only the last dark one stays.
  const lastDark = valid.map((v, i) => (v.type === 'cta' && v.data.tone === 'dark' ? i : -1)).filter((i) => i >= 0).pop()
  const seenCta = new Set<string>()
  for (let i = valid.length - 1; i >= 0; i--) {
    const v = valid[i]
    if (v.type !== 'cta') continue
    const key = v.data.heading.trim().toLowerCase()
    if (seenCta.has(key) || (v.data.tone === 'dark' && i !== lastDark)) valid.splice(i, 1)
    else seenCta.add(key)
  }
  // The homepage has its own composition (hero, introduction, service panels, ...), built from the same stored sections.
  if (ctx.kind === 'home') {
    return <HomeLayout sections={valid} ctx={ctx} renderOther={(s) => renderSection(s, valid.indexOf(s), 'white', ctx)} />
  }
  // Light sections alternate white and paper; dark sections (hero, dark call to action) keep their own colour.
  let light = 0
  const items = layoutSections(valid)
  const nextTone = (): Tone => (light++ % 2 === 0 ? 'white' : 'paper')
  // Service pages: reviews for this service (or its category), before the closing call-to-action.
  const lastIdx = items.length - 1
  const lastIsCta = lastIdx >= 0 && items[lastIdx].kind === 'one' && (items[lastIdx] as { section: Section }).section.type === 'cta'
  const reviewsBefore = ctx.kind === 'service' ? (lastIsCta ? lastIdx : -1) : -1
  const reviewsAfterLast = ctx.kind === 'service' && !lastIsCta
  return (
    <>
      {items.map((item, itemIndex) => {
        const tone: Tone = item.kind === 'group' ? nextTone() : isDark(item.section) ? 'white' : nextTone()
        if (item.kind === 'group') return <ContentBlockGroup key={item.id} blocks={item.blocks} tone={tone} />
        return (
          <div key={item.section.id}>
            {itemIndex === reviewsBefore && <ReviewsSection reviews={ctx.reviews ?? []} stats={ctx.reviewStats} tone="paper" />}
            {renderSection(item.section, item.index, tone, ctx)}
            {reviewsAfterLast && itemIndex === lastIdx && <ReviewsSection reviews={ctx.reviews ?? []} stats={ctx.reviewStats} tone="paper" />}
          </div>
        )
      })}
    </>
  )
}
