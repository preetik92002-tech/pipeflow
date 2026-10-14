import { createPublicClient } from '@/lib/supabase/public'
import type { BlogPost } from '@/lib/blog/types'
import type { CmsBlog, CmsService, CmsServiceArea, HomepageContent } from './types'
import type { Testimonial, Service, FAQ } from '@/types'
import { resolveImage } from '@/lib/media/photos'

export function toBlogPost(row: CmsBlog): BlogPost {
  const categoryName = row.category_name || 'Home Care'
  return {
    id: row.id, title: row.title, slug: row.slug, seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined, excerpt: row.excerpt || '', author: row.author,
    featuredImage: resolveImage(row.featured_image || '/art/hero-plumbing.svg').src, featuredImageAlt: row.featured_image_alt || row.title,
    categoryId: row.category_slug || 'general', categoryName, categorySlug: row.category_slug || 'general',
    tags: [], publishedAt: row.published_at || row.created_at, updatedAt: row.updated_at, status: row.status,
    body: row.body, readingTimeMinutes: Math.max(1, Math.ceil(row.body.split(/\s+/).length / 200)),
    noindex: row.noindex, createdAt: row.created_at,
  }
}

export function toBlogPosts(rows: CmsBlog[]): BlogPost[] { return rows.map(toBlogPost) }

export async function getPublishedBlogs(): Promise<CmsBlog[]> {
  const supabase = createPublicClient()
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
  const supabase = createPublicClient()
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
  const supabase = createPublicClient()
  let query = supabase.from('services').select('*').eq('active', true).order('display_order')
  if (category) query = query.eq('category', category)
  if (ids?.length) query = query.in('id', ids)
  const { data, error } = await query
  if (error) throw new Error(`Unable to load services: ${error.message}`)
  const rows = (data ?? []) as CmsService[]
  return ids?.length ? [...rows].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)) : rows
}

export async function getService(category: string, slug: string): Promise<CmsService | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('services').select('*').eq('category', category).eq('slug', slug).eq('active', true).maybeSingle()
  if (error) throw new Error(`Unable to load service: ${error.message}`)
  return (data as CmsService | null) ?? null
}

export async function getServiceAreas(slugs?: string[]): Promise<CmsServiceArea[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('service_areas').select('*').eq('active', true).order('sort_order')
  if (error) throw new Error(`Unable to load service areas: ${error.message}`)
  const rows = (data ?? []) as CmsServiceArea[]
  const selected = slugs?.length ? rows.filter((row) => slugs.includes(row.slug)).sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug)) : rows
  return selected
}

export async function getServiceArea(slug: string): Promise<CmsServiceArea | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('service_areas').select('*').eq('slug', slug).eq('active', true).maybeSingle()
  if (error) throw new Error(`Unable to load service area: ${error.message}`)
  if (!data) return null
  return { ...(data as CmsServiceArea), zip_codes: await getServiceAreaZipCodes(data.id) }
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('homepage_content').select('content').eq('id', 'home').single()
  if (error) throw new Error(`Unable to load homepage CMS content: ${error.message}`)
  return data.content as HomepageContent
}

export async function getServiceAreaZipCodes(areaId: string): Promise<string[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('service_area_zips').select('zip_code').eq('service_area_id', areaId)
  if (error) throw new Error(`Unable to load service area ZIP codes: ${error.message}`)
  return (data ?? []).map((row) => row.zip_code)
}

export async function getHomepageTestimonials(ids: string[]): Promise<Testimonial[]> {
  if (!ids.length) return []
  const supabase = createPublicClient()
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
  const supabase = createPublicClient()
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

export interface ReviewRow { name: string; city?: string; rating: number; text: string; service?: string; date?: string; verified: boolean; source?: string }

/**
 * Active customer reviews, newest first (the admin Testimonials list). Home page: the latest few. Service page: reviews for that
 * service, else its category. `count` and `average` come from the same eligible set; any error yields an empty result so the page still renders.
 */
export async function getActiveReviews(limit = 6, forPath?: { path: string; title: string }): Promise<{ items: ReviewRow[]; count: number; average: number | null }> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('testimonials').select('*').eq('active', true).order('created_at', { ascending: false }).limit(200)
    if (error) return { items: [], count: 0, average: null }
    const rows = forPath ? relevantRows(data ?? [], forPath) : data ?? []
    const items: ReviewRow[] = rows.slice(0, limit).map((row) => ({
      name: row.reviewer_name as string,
      city: (row.reviewer_city as string | null) || undefined,
      rating: Math.min(5, Math.max(1, Number(row.rating ?? 5))),
      text: row.review_text as string,
      service: (row.service_name as string | null) || undefined,
      date: (row.date as string | null) || undefined,
      verified: Boolean(row.verified),
      source: (row.source as string | null) || undefined,
    }))
    const rated = rows.map((r) => Number(r.rating)).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5)
    return { items, count: rows.length, average: rated.length ? rated.reduce((a, n) => a + n, 0) / rated.length : null }
  } catch {
    return { items: [], count: 0, average: null }
  }
}

/** Reviews for a service page: same service name first, else the same category (plumbing / hvac). Nothing else is claimed to be relevant. */
function relevantRows<T extends { service_name?: string | null }>(rows: T[], { path, title }: { path: string; title: string }): T[] {
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  const t = norm(title)
  const exact = rows.filter((r) => r.service_name && norm(r.service_name) === t)
  if (exact.length) return exact
  const cat = path.startsWith('hvac') ? /hvac|\bac\b|air cond|heat(?!er)|cool|furnace/ : path.startsWith('plumbing') ? /plumb|water|pipe|drain|faucet|leak/ : null
  return cat ? rows.filter((r) => r.service_name && cat.test(norm(r.service_name))) : []
}
