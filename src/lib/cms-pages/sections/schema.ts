import { z } from 'zod'
import { buttonSchema, hrefSchema, imageSrcSchema } from '../links'
import { richTextSchema } from '../richtext'

/**
 * One Zod schema per section type. The same schemas validate what the editor
 * sends and what the public page reads back, so bad data cannot render.
 * Adding a type = a schema here, a renderer, an editor form, and one line in
 * registry.ts. No database change: sections are JSON.
 */
const text = (max: number) => z.string().trim().max(max)
const heading = (max = 180) => z.string().trim().min(1, 'A heading is required.').max(max)
const buttons = z.array(buttonSchema).max(2)

export const heroData = z.object({
  eyebrow: text(120).default(''),
  heading: heading(),
  subtitle: text(500).default(''),
  intro: text(2000).default(''),
  image: imageSrcSchema.default(''),
  // Khaali ho to built-in photo ka alt use hota hai; purane pages par default '' se kuch nahi tootta.
  imageAlt: text(250).default(''),
  buttons: buttons.default([]),
  align: z.enum(['left', 'center']).default('left'),
})

export const richTextData = z.object({ content: richTextSchema })

export const contentBlockData = z.object({
  label: text(60).default(''),
  heading: heading(),
  content: richTextSchema,
  image: imageSrcSchema.default(''),
  imageAlt: text(250).default(''),
  imagePosition: z.enum(['none', 'left', 'right']).default('none'),
  button: buttonSchema.nullable().default(null),
})

export const galleryData = z.object({
  heading: text(180).default(''),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  images: z
    .array(z.object({ src: imageSrcSchema.refine((v) => v !== '', 'Choose an image.'), alt: text(250).default(''), caption: text(250).default('') }))
    .max(24)
    .default([]),
})

export const featureCardsData = z.object({
  heading: text(180).default(''),
  intro: text(1000).default(''),
  cards: z
    .array(z.object({ title: heading(120), text: text(600).default(''), href: hrefSchema.or(z.literal('')).default(''), image: imageSrcSchema.default(''), imageAlt: text(250).default('') }))
    .max(12)
    .default([]),
})

export const comparisonData = z.object({
  heading: heading(),
  intro: text(1000).default(''),
  columns: z
    .array(z.object({ title: heading(120), items: z.array(text(300).min(1)).max(20).default([]) }))
    .min(2)
    .max(3),
  outro: text(2000).default(''),
  buttons: z.array(buttonSchema).max(1).default([]),
})

export const stepsData = z.object({
  heading: heading(),
  intro: text(1000).default(''),
  steps: z.array(z.object({ title: heading(120), text: text(600).default('') })).max(12).default([]),
  buttons: z.array(buttonSchema).max(1).default([]),
})

export const faqData = z.object({
  heading: heading(),
  items: z
    .array(z.object({ question: z.string().trim().min(1, 'A question is required.').max(300), answer: z.string().trim().min(1, 'An answer is required.').max(3000) }))
    .max(30)
    .default([]),
})

export const ctaData = z.object({
  heading: heading(),
  text: text(1000).default(''),
  buttons: buttons.default([]),
  tone: z.enum(['dark', 'light']).default('dark'),
})

export const testimonialsData = z.object({
  heading: heading(),
  items: z
    .array(z.object({ quote: z.string().trim().min(1).max(1000), name: z.string().trim().min(1).max(120), location: text(120).default(''), rating: z.number().int().min(1).max(5).nullable().default(null) }))
    .max(12)
    .default([]),
})

export const linkListData = z.object({
  heading: heading(),
  links: z.array(z.object({ label: z.string().trim().min(1, 'Link text is required.').max(120), href: hrefSchema })).max(20).default([]),
})

export const contactInfoData = z.object({
  heading: heading(),
  phone: text(40).default(''),
  email: z.string().trim().max(200).default(''),
  address: text(300).default(''),
  hours: text(300).default(''),
})

export const spacerData = z.object({ size: z.enum(['sm', 'md', 'lg']).default('md') })

const id = z.string().uuid()

export const sectionSchema = z.discriminatedUnion('type', [
  z.object({ id, type: z.literal('hero'), data: heroData }),
  z.object({ id, type: z.literal('richText'), data: richTextData }),
  z.object({ id, type: z.literal('contentBlock'), data: contentBlockData }),
  z.object({ id, type: z.literal('gallery'), data: galleryData }),
  z.object({ id, type: z.literal('featureCards'), data: featureCardsData }),
  z.object({ id, type: z.literal('comparison'), data: comparisonData }),
  z.object({ id, type: z.literal('steps'), data: stepsData }),
  z.object({ id, type: z.literal('faq'), data: faqData }),
  z.object({ id, type: z.literal('cta'), data: ctaData }),
  z.object({ id, type: z.literal('testimonials'), data: testimonialsData }),
  z.object({ id, type: z.literal('linkList'), data: linkListData }),
  z.object({ id, type: z.literal('contactInfo'), data: contactInfoData }),
  z.object({ id, type: z.literal('spacer'), data: spacerData }),
])

export const MAX_SECTIONS = 60
export const sectionsSchema = z.array(sectionSchema).max(MAX_SECTIONS)

export type Section = z.infer<typeof sectionSchema>
export type SectionType = Section['type']
export type SectionOf<T extends SectionType> = Extract<Section, { type: T }>
export type SectionData<T extends SectionType> = SectionOf<T>['data']

/** Section as the editor holds it while typing: not yet validated. */
export type DraftSection = { id: string; type: SectionType; data: Record<string, unknown> }
