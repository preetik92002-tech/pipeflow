import type { SectionType } from './schema'
import {
  heroData, richTextData, contentBlockData, galleryData, featureCardsData, comparisonData,
  stepsData, faqData, ctaData, testimonialsData, linkListData, contactInfoData, spacerData,
} from './schema'
import { emptyRichText } from '../richtext'

export interface SectionMeta {
  type: SectionType
  label: string
  description: string
  /** Fresh data for "Add section". Must pass the type's schema once the required fields are filled. */
  defaults: () => Record<string, unknown>
}

export const SECTION_TYPES: SectionMeta[] = [
  { type: 'hero', label: 'Hero', description: 'Page header with heading, subtitle, image and up to two buttons.', defaults: () => ({ eyebrow: '', heading: 'New heading', subtitle: '', intro: '', image: '', buttons: [], align: 'left' }) },
  { type: 'richText', label: 'Rich text', description: 'Formatted text: headings, lists, links.', defaults: () => ({ content: emptyRichText() }) },
  { type: 'contentBlock', label: 'Image and text', description: 'Heading and text, optionally with an image on one side and a button.', defaults: () => ({ label: '', heading: 'New heading', content: emptyRichText(), image: '', imageAlt: '', imagePosition: 'none', button: null }) },
  { type: 'gallery', label: 'Image gallery', description: 'A grid of images with captions.', defaults: () => ({ heading: '', columns: 3, images: [] }) },
  { type: 'featureCards', label: 'Feature cards', description: 'A row of cards with title, text and optional link.', defaults: () => ({ heading: 'New heading', intro: '', cards: [] }) },
  { type: 'comparison', label: 'Comparison', description: 'Two or three columns of bullet points side by side.', defaults: () => ({ heading: 'New heading', columns: [{ title: 'Option one', items: [] }, { title: 'Option two', items: [] }] }) },
  { type: 'steps', label: 'Numbered steps', description: 'A numbered list of steps.', defaults: () => ({ heading: 'New heading', steps: [] }) },
  { type: 'faq', label: 'FAQ', description: 'Questions and answers.', defaults: () => ({ heading: 'Frequently Asked Questions', items: [] }) },
  { type: 'cta', label: 'Call to action', description: 'A highlighted band with text and up to two buttons.', defaults: () => ({ heading: 'New heading', text: '', buttons: [], tone: 'dark' }) },
  { type: 'testimonials', label: 'Testimonials', description: 'Customer quotes. Only add real, verified reviews.', defaults: () => ({ heading: 'What Customers Are Saying', items: [] }) },
  { type: 'linkList', label: 'Link list', description: 'A list of links, such as related services.', defaults: () => ({ heading: 'New heading', links: [] }) },
  { type: 'contactInfo', label: 'Contact info', description: 'Phone, email, address and hours.', defaults: () => ({ heading: 'Contact us', phone: '', email: '', address: '', hours: '' }) },
  { type: 'spacer', label: 'Spacer', description: 'Empty space between sections.', defaults: () => ({ size: 'md' }) },
]

export const sectionMeta = (type: string) => SECTION_TYPES.find((s) => s.type === type)

export const dataSchemas = {
  hero: heroData, richText: richTextData, contentBlock: contentBlockData, gallery: galleryData,
  featureCards: featureCardsData, comparison: comparisonData, steps: stepsData, faq: faqData,
  cta: ctaData, testimonials: testimonialsData, linkList: linkListData, contactInfo: contactInfoData,
  spacer: spacerData,
} as const
