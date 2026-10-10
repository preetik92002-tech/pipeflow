import { sectionsSchema } from './sections/schema'

/** FAQPage structured data built from the page's FAQ sections, or null if it has none. */
export function faqJsonLd(sections: unknown): Record<string, unknown> | null {
  const list = Array.isArray(sections) ? sections : []
  const entities = list.flatMap((raw) => {
    const parsed = sectionsSchema.element.safeParse(raw)
    if (!parsed.success || parsed.data.type !== 'faq') return []
    return parsed.data.data.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    }))
  })
  if (!entities.length) return null
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities }
}

/** JSON for a <script type="application/ld+json"> tag. "<" is escaped so content can never close the tag. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
