export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface CompanyInfo {
  name: string
  tagline: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  license?: string
  founded?: number
}

export interface ServiceArea {
  id: string
  name: string
  slug: string
  state: string
  zipCodes?: string[]
  description?: string
  active: boolean
  primary: boolean
}

export interface Service {
  id: string
  title: string
  slug: string
  category: 'plumbing' | 'hvac' | 'emergency' | 'other'
  shortDescription: string
  description: string
  iconName: string
  imageUrl?: string
  featured: boolean
  emergency: boolean
}

export interface Testimonial {
  id: string
  reviewerName: string
  reviewerCity?: string
  rating: number
  reviewText: string
  serviceName?: string
  date: string
  verified: boolean
  source?: 'google' | 'yelp' | 'bbb' | 'internal'
  imageUrl?: string
}

export interface TrustBadge {
  id: string
  label: string
  iconName: string
  description?: string
}

export interface TrustPrinciple {
  id: string
  title: string
  description: string
  iconName: string
}

export interface HowItWorksStep {
  step: number
  title: string
  description: string
  iconName: string
}

export interface SpecialOffer {
  id: string
  badge: string
  title: string
  description: string
  discountCode?: string
  disclaimer: string
  ctaText: string
  ctaHref: string
  active: boolean
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category?: string
  order: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  imageUrl?: string
  publishedAt: string
  author: string
  featured: boolean
  published: boolean
}

export interface HeroContent {
  headline: string
  subheadline: string
  primaryCTA: { label: string; href: string }
  secondaryCTA: { label: string; href: string }
  backgroundImageUrl: string
}

export interface CTAConfig {
  bookService: { label: string; href: string }
  getQuote: { label: string; href: string }
  callNow: { label: string; phone: string }
  joinPro: { label: string; href: string }
}

export interface AnnouncementBarConfig {
  enabled: boolean
  messages: string[]
  bgColor?: string
  textColor?: string
}

export interface SiteConfig {
  company: CompanyInfo
  nav: NavItem[]
  ctas: CTAConfig
  announcement: AnnouncementBarConfig
  defaultServiceAreas: ServiceArea[]
  defaultServices: Service[]
  defaultTestimonials: Testimonial[]
  defaultTrustPrinciples: TrustPrinciple[]
  defaultHowItWorks: HowItWorksStep[]
  defaultSpecialOffer: SpecialOffer
  defaultBlogPosts: BlogPost[]
  defaultFAQs: FAQ[]
  defaultTrustBadges: TrustBadge[]
  social: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
    google?: string
  }
  seo: {
    defaultTitle: string
    titleTemplate: string
    defaultDescription: string
    keywords: string[]
  }
}

export interface LeadFormData {
  name: string
  phone: string
  email?: string
  serviceCategory: 'plumbing' | 'hvac' | 'emergency' | 'other'
  specificService: string
  zipCode: string
  preferredTime?: string
  preferredDate?: string
  message?: string
  photoName?: string
  photoSize?: number
  isEmergency: boolean
  // Marketing & attribution tracking
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  gclid?: string
  fbclid?: string
  referrer?: string
  landingPage?: string
  submittedAt?: string
}

export interface QuoteFormData {
  name: string
  phone: string
  email: string
  address: string
  serviceType: string
  description: string
  preferredDate?: string
}
