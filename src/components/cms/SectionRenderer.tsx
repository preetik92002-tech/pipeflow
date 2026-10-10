import type { Section } from '@/lib/cms-pages/sections/schema'
import { sectionsSchema } from '@/lib/cms-pages/sections/schema'
import {
  HeroSection, RichTextSection, ContentBlockSection, GallerySection, FeatureCardsSection, ComparisonSection,
  StepsSection, FaqSection, CtaSection, TestimonialsSection, LinkListSection, ContactInfoSection, SpacerSection,
} from './sections'

function renderSection(section: Section, index: number) {
  switch (section.type) {
    case 'hero': return <HeroSection data={section.data} first={index === 0} />
    case 'richText': return <RichTextSection data={section.data} />
    case 'contentBlock': return <ContentBlockSection data={section.data} />
    case 'gallery': return <GallerySection data={section.data} />
    case 'featureCards': return <FeatureCardsSection data={section.data} />
    case 'comparison': return <ComparisonSection data={section.data} />
    case 'steps': return <StepsSection data={section.data} />
    case 'faq': return <FaqSection data={section.data} />
    case 'cta': return <CtaSection data={section.data} />
    case 'testimonials': return <TestimonialsSection data={section.data} />
    case 'linkList': return <LinkListSection data={section.data} />
    case 'contactInfo': return <ContactInfoSection data={section.data} />
    case 'spacer': return <SpacerSection data={section.data} />
  }
}

/**
 * Validates stored sections and renders each as a Server Component. A section
 * that fails validation is skipped on the public site instead of breaking the page.
 */
export function SectionRenderer({ sections }: { sections: unknown }) {
  const list = Array.isArray(sections) ? sections : []
  const valid: Section[] = []
  for (const raw of list) {
    const parsed = sectionsSchema.element.safeParse(raw)
    if (parsed.success) valid.push(parsed.data)
  }
  return (
    <>
      {valid.map((section, i) => (
        <div key={section.id}>{renderSection(section, i)}</div>
      ))}
    </>
  )
}
