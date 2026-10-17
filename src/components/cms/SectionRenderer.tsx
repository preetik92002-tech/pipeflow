import type { Section, SectionData } from '@/lib/cms-pages/sections/schema'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'
import {
  HeroSection, RichTextSection, ContentBlockSection, ContentBlockGroup, GallerySection, FeatureCardsSection, ComparisonSection,
  StepsSection, FaqSection, CtaSection, TestimonialsSection, LinkListSection, ContactInfoSection, SpacerSection, TextMarquee, ReviewsSection, SlantDivider, JunctionAvatar, AboutBlock,
  type PageContext, type Tone, type Look,
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

function renderSection(section: Section, index: number, tone: Tone, ctx: PageContext, look?: Look) {
  switch (section.type) {
    case 'hero': return <HeroSection data={section.data} first={index === 0} ctx={ctx} />
    case 'richText': return <RichTextSection data={section.data} tone={tone} />
    case 'contentBlock': return <ContentBlockSection data={section.data} tone={tone} />
    case 'gallery': return <GallerySection data={section.data} tone={tone} />
    case 'featureCards': return <FeatureCardsSection data={section.data} tone={tone} look={look} />
    case 'comparison': return <ComparisonSection data={section.data} tone={tone} />
    case 'steps': return <StepsSection data={section.data} ctx={ctx} />
    case 'faq': return <FaqSection data={section.data} tone={tone} />
    case 'cta': return <CtaSection data={section.data} tone={tone} />
    case 'testimonials': return <TestimonialsSection data={section.data} tone={tone} />
    case 'linkList': return <LinkListSection data={section.data} tone={tone} ctx={ctx} look={look} />
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
  // Split hero paper par hota hai, isliye uske baad pehla light section white se shuru.
  let light = 0
  let marqueeShown = false
  const items = layoutSections(valid)
  // Reviews go right after the last service list (Plumbing, then HVAC), home page only.
  // Home service sections (photo cards, Plumbing, HVAC) alternate dark navy / light, with slanted edges that criss-cross.
  const isServiceBlock = (it: (typeof items)[number]) =>
    it.kind === 'one' && ((it.section.type === 'featureCards' && it.section.data.cards.some((c) => c.image) && it.section.data.cards.every((c) => c.href)) || it.section.type === 'linkList')
  const serviceBlocks = ctx.kind === 'home' ? items.map((it, i) => (isServiceBlock(it) ? i : -1)).filter((i) => i >= 0) : []
  const lastLinkList = ctx.kind === 'home' ? items.reduce((n, it, i) => (it.kind === 'one' && it.section.type === 'linkList' ? i : n), -1) : -1
  const nextTone = (): Tone => (light++ % 2 === 0 ? 'white' : 'paper')
  const lookFor = (i: number): Look | undefined => {
    const n = serviceBlocks.indexOf(i)
    if (n < 0 || n % 2 !== 0) return undefined
    return { dark: true, slant: n === 0 ? 'c' : (n / 2) % 2 === 0 ? 'a' : 'b', bar: n === serviceBlocks.length - 1 }
  }
  // Angled seams between every pair of sections that meet on a flat edge. Hero, spacers and the slanted home bands keep their own edges.
  const bgOf = (it: (typeof items)[number], tone: Tone, look?: Look): string | null => {
    if (look?.dark) return null
    if (it.kind === 'group') return tone === 'white' ? 'bg-white' : 'bg-paper'
    const t = it.section.type
    if (t === 'hero' || t === 'spacer') return null
    if (t === 'steps' || t === 'testimonials' || (t === 'cta' && it.section.data.tone === 'dark')) return 'bg-navy-900'
    return tone === 'white' ? 'bg-white' : 'bg-paper'
  }
  let prevBg: string | null = null
  let seams = 0
  // Mascot pose by page: plumbing pages fixing a pipe, contact pages waving, everything else pointing at a fitting.
  const trail = ctx.crumbs.map((c) => `${c.href ?? ''} ${c.label}`).join(' ').toLowerCase()
  const pose: 1 | 2 | 3 | 4 = /plumb|water|pipe|drain/.test(trail) ? 2 : /contact|join|about/.test(trail) ? 4 : 3
  // Service pages: reviews for this service (or its category), before the closing call-to-action.
  const lastIdx = items.length - 1
  const lastIsCta = lastIdx >= 0 && items[lastIdx].kind === 'one' && (items[lastIdx] as { section: Section }).section.type === 'cta'
  const reviewsBefore = ctx.kind === 'service' ? (lastIsCta ? lastIdx : -1) : -1
  const reviewsAfterLast = ctx.kind === 'service' && !lastIsCta
  const avatarAfter = ctx.kind === 'home' ? lastLinkList : items.length > 3 ? 1 : -1
  return (
    <>
      {items.map((item, itemIndex) => {
        const look = lookFor(itemIndex)
        const tone: Tone = item.kind === 'group' ? nextTone() : isDark(item.section) ? 'white' : nextTone()
        const bg = bgOf(item, tone, look)
        const divider = bg && prevBg && bg !== prevBg ? <SlantDivider from={prevBg} to={bg} flip={seams++ % 2 === 1} /> : null
        prevBg = bg
        if (item.kind === 'group') return <div key={item.id}>{divider}<ContentBlockGroup blocks={item.blocks} tone={tone} /></div>
        // Home par pehli photo-tiles wali section ke baad photo strip: ek hi scroll-journey ka hissa, naya content nahi.
        const marqueeAfter = ctx.kind === 'home' && item.section.type === 'featureCards' && !marqueeShown && item.section.data.cards.some((c) => c.image)
        if (marqueeAfter) marqueeShown = true
        if (marqueeAfter) prevBg = null
        return (
          <div key={item.section.id} id={ctx.kind === 'home' && itemIndex === serviceBlocks[0] ? 'services' : undefined} className={ctx.kind === 'home' && itemIndex === serviceBlocks[0] ? 'scroll-mt-32' : undefined}>
            {divider}
            {itemIndex === reviewsBefore && <ReviewsSection reviews={ctx.reviews ?? []} stats={ctx.reviewStats} />}
            {renderSection(item.section, item.index, tone, ctx, look)}
            {marqueeAfter && <TextMarquee />}
            {itemIndex === avatarAfter && ctx.kind !== 'home' && <JunctionAvatar flip={itemIndex % 2 === 0} pose={pose} />}
            {itemIndex === lastLinkList && <JunctionAvatar hideButton />}
            {itemIndex === lastLinkList && <ReviewsSection reviews={ctx.reviews ?? []} stats={ctx.reviewStats} />}
            {reviewsAfterLast && itemIndex === lastIdx && <ReviewsSection reviews={ctx.reviews ?? []} stats={ctx.reviewStats} />}
          </div>
        )
      })}
    </>
  )
}
