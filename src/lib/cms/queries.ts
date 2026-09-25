import { createClient } from '@/lib/supabase/server'
import type { BlogPost } from '@/lib/blog/types'
import type { CmsBlog, CmsService, CmsServiceArea, HomepageContent } from './types'
import type { Testimonial, Service, FAQ } from '@/types'

export function toBlogPost(row: CmsBlog): BlogPost {
  const categoryName = row.category_name || 'Home Care'
  return {
    id: row.id, title: row.title, slug: row.slug, seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined, excerpt: row.excerpt || '', author: row.author,
    featuredImage: row.featured_image || '/assets/service-plumbing.jpg', featuredImageAlt: row.featured_image_alt || row.title,
    categoryId: row.category_slug || 'general', categoryName, categorySlug: row.category_slug || 'general',
    tags: [], publishedAt: row.published_at || row.created_at, updatedAt: row.updated_at, status: row.status,
    body: row.body, readingTimeMinutes: Math.max(1, Math.ceil(row.body.split(/\s+/).length / 200)),
    noindex: row.noindex, createdAt: row.created_at,
  }
}

export function toBlogPosts(rows: CmsBlog[]): BlogPost[] { return rows.map(toBlogPost) }

export async function getPublishedBlogs(): Promise<CmsBlog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  if (error) throw new Error(`Unable to load published blogs: ${error.message}`)
  return (data ?? []) as CmsBlog[]
}

export async function getPublishedBlogBySlug(slug: string): Promise<CmsBlog | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle()
  if (error) throw new Error(`Unable to load blog post: ${error.message}`)
  return (data as CmsBlog | null) ?? null
}

export async function getServices(category?: string, ids?: string[]): Promise<CmsService[]> {
  const supabase = await createClient()
  let query = supabase.from('services').select('*').eq('active', true).order('display_order')
  if (category) query = query.eq('category', category)
  if (ids?.length) query = query.in('id', ids)
  const { data, error } = await query
  if (error) throw new Error(`Unable to load services: ${error.message}`)
  const rows = (data ?? []) as CmsService[]
  return ids?.length ? [...rows].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)) : rows
}

export async function getService(category: string, slug: string): Promise<CmsService | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('services').select('*').eq('category', category).eq('slug', slug).eq('active', true).maybeSingle()
  if (error) throw new Error(`Unable to load service: ${error.message}`)
  return (data as CmsService | null) ?? null
}

export async function getServiceAreas(slugs?: string[]): Promise<CmsServiceArea[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('service_areas').select('*').eq('active', true).order('sort_order')
  if (error) throw new Error(`Unable to load service areas: ${error.message}`)
  const rows = (data ?? []) as CmsServiceArea[]
  const selected = slugs?.length ? rows.filter((row) => slugs.includes(row.slug)).sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug)) : rows
  return selected
}

export async function getServiceArea(slug: string): Promise<CmsServiceArea | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('service_areas').select('*').eq('slug', slug).eq('active', true).maybeSingle()
  if (error) throw new Error(`Unable to load service area: ${error.message}`)
  if (!data) return null
  return { ...(data as CmsServiceArea), zip_codes: await getServiceAreaZipCodes(data.id) }
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('homepage_content').select('content').eq('id', 'home').single()
  if (error) throw new Error(`Unable to load homepage CMS content: ${error.message}`)
  return data.content as HomepageContent
}

export async function getServiceAreaZipCodes(areaId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('service_area_zips').select('zip_code').eq('service_area_id', areaId)
  if (error) throw new Error(`Unable to load service area ZIP codes: ${error.message}`)
  return (data ?? []).map((row) => row.zip_code)
}

export async function getHomepageTestimonials(ids: string[]): Promise<Testimonial[]> {
  if (!ids.length) return []
  const supabase = await createClient()
  const { data, error } = await supabase.from('testimonials').select('*').in('id', ids).eq('active', true)
  if (error) throw new Error(`Unable to load testimonials: ${error.message}`)
  const rows = data ?? []
  rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
  return rows.map((row) => ({
    id: row.id, reviewerName: row.reviewer_name, reviewerCity: row.reviewer_city || undefined,
    rating: row.rating ?? 5, reviewText: row.review_text, serviceName: row.service_name || undefined,
    date: row.date || '', verified: Boolean(row.verified), source: row.source || undefined, imageUrl: row.image_url || undefined,
  }))
}

export async function getHomepageFaqs(ids: string[]): Promise<FAQ[]> {
  if (!ids.length) return []
  const supabase = await createClient()
  const { data, error } = await supabase.from('faqs').select('*').in('id', ids).eq('active', true)
  if (error) throw new Error(`Unable to load FAQs: ${error.message}`)
  const rows = data ?? []
  rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
  return rows.map((row, index) => ({ id: row.id, question: row.question, answer: row.answer, order: index }))
}

export function toSiteService(service: CmsService): Service {
  return {
    id: service.id, title: service.title, slug: service.slug,
    category: service.category as Service['category'], shortDescription: service.short_description,
    description: service.description || '', iconName: 'wrench', imageUrl: service.image_url || undefined,
    featured: service.featured, emergency: service.category === 'emergency',
  }
}

export function toSiteServiceArea(area: CmsServiceArea): import('@/types').ServiceArea {
  return { id: area.id, name: area.name, slug: area.slug, state: area.state, zipCodes: area.zip_codes, description: area.description || undefined, active: area.active, primary: Boolean(area.primary_area) }
}
