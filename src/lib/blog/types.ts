export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export interface BlogFAQ {
  question: string
  answer: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  sortOrder: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  seoTitle?: string
  seoDescription?: string
  excerpt: string
  author: string
  authorRole?: string
  authorAvatar?: string
  featuredImage: string
  featuredImageAlt?: string
  categoryId: string
  categoryName: string
  categorySlug: string
  tags: string[]
  publishedAt: string
  updatedAt?: string
  status: BlogStatus
  body: string
  readingTimeMinutes: number
  canonicalUrl?: string
  noindex?: boolean
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  faqs?: BlogFAQ[]
  ctaType?: 'plumbing' | 'hvac' | 'emergency' | 'quote' | 'book'
  relatedServiceSlug?: string
  relatedServiceAreaSlug?: string
  viewsCount?: number
  createdAt: string
}

export interface BlogFilterOptions {
  category?: string
  status?: BlogStatus
  search?: string
  tag?: string
  author?: string
  page?: number
  limit?: number
}
