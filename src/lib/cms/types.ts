export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export interface CmsBlog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  featured_image: string | null
  featured_image_alt: string | null
  author: string
  status: BlogStatus
  published_at: string | null
  created_at: string
  updated_at: string
  seo_title: string | null
  seo_description: string | null
  category_name: string | null
  category_slug: string | null
  noindex: boolean
}

export interface CmsService {
  id: string
  title: string
  slug: string
  category: string
  category_id: string | null
  short_description: string
  description: string | null
  image_url: string | null
  active: boolean
  featured: boolean
  display_order: number
  seo_title: string | null
  seo_description: string | null
}

export interface CmsServiceArea {
  id: string
  name: string
  slug: string
  state: string
  description: string | null
  hero_image: string | null
  active: boolean
  primary_area?: boolean
  sort_order: number
  seo_title: string | null
  seo_description: string | null
  zip_codes?: string[]
}

export interface HomepageContent {
  hero: {
    eyebrow: string
    headline: string
    description: string
    primaryCtaText: string
    primaryCtaUrl: string
    secondaryCtaText: string
    secondaryCtaUrl: string
    image: string
    active: boolean
  }
  services: { heading: string; description: string; ids: string[]; active: boolean }
  stats: { number: string; label: string; active: boolean; order: number }[]
  trust: { title: string; description: string; iconName: string; active: boolean; order: number }[]
  process: { heading: string; description: string; steps: { title: string; description: string; order: number }[]; active: boolean }
  testimonialIds: string[]
  serviceAreas: { heading: string; description: string; slugs: string[]; active: boolean }
  faqIds: string[]
  faqHeading: string
  faqDescription: string
  promotion: { heading: string; description: string; ctaText: string; ctaUrl: string; image: string; active: boolean }
  finalCta: { heading: string; description: string; ctaText: string; ctaUrl: string }
}
