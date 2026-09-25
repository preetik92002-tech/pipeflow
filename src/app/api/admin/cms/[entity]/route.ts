import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import type { BlogStatus } from '@/lib/cms/types'

const slugSchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens for slugs.')
const linkSchema = z.string().trim().min(1).max(2000).refine((value) => {
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}, 'Use a site path or HTTP(S) URL.')
const homepageSchema = z.object({
  hero: z.object({ eyebrow: z.string().max(120), headline: z.string().min(1).max(240), description: z.string().max(2000), primaryCtaText: z.string().max(80), primaryCtaUrl: linkSchema, secondaryCtaText: z.string().max(80), secondaryCtaUrl: linkSchema, image: z.string().max(2000), active: z.boolean() }),
  services: z.object({ heading: z.string().max(240), description: z.string().max(2000), ids: z.array(z.string().uuid()).max(100), active: z.boolean() }),
  stats: z.array(z.object({ number: z.string().max(40), label: z.string().max(120), active: z.boolean(), order: z.number().int().min(0).max(10000) })).max(20),
  trust: z.array(z.object({ title: z.string().max(160), description: z.string().max(1000), iconName: z.string().max(80), active: z.boolean(), order: z.number().int().min(0).max(10000) })).max(30),
  process: z.object({ heading: z.string().max(240), description: z.string().max(2000), steps: z.array(z.object({ title: z.string().max(160), description: z.string().max(1000), order: z.number().int().min(0).max(10000) })).max(20), active: z.boolean() }),
  testimonialIds: z.array(z.string().uuid()).max(100),
  serviceAreas: z.object({ heading: z.string().max(240), description: z.string().max(2000), slugs: z.array(slugSchema).max(100), active: z.boolean() }),
  faqIds: z.array(z.string().uuid()).max(100), faqHeading: z.string().max(240), faqDescription: z.string().max(2000),
  promotion: z.object({ heading: z.string().max(240), description: z.string().max(2000), ctaText: z.string().max(80), ctaUrl: linkSchema, image: z.string().max(2000), active: z.boolean() }),
  finalCta: z.object({ heading: z.string().max(240), description: z.string().max(2000), ctaText: z.string().max(80), ctaUrl: linkSchema }),
})
const schemas = {
  blog: z.object({
    title: z.string().trim().min(1).max(180), slug: slugSchema, excerpt: z.string().max(500).nullable().optional(),
    body: z.string().min(1), featured_image: z.string().max(2000).nullable().optional(), featured_image_alt: z.string().max(250).nullable().optional(),
    author: z.string().trim().min(1).max(120), status: z.enum(['draft','scheduled','published','archived']),
    published_at: z.string().datetime().nullable().optional(), seo_title: z.string().max(180).nullable().optional(), seo_description: z.string().max(320).nullable().optional(),
    category_name: z.string().max(100).nullable().optional(), category_slug: z.string().max(100).nullable().optional(), noindex: z.boolean().optional(),
  }),
  service: z.object({ title: z.string().trim().min(1).max(120), slug: slugSchema, category: z.enum(['plumbing','hvac','emergency']),
    category_id: z.string().uuid().nullable().optional(), short_description: z.string().trim().min(1).max(300), description: z.string().nullable().optional(),
    image_url: z.string().max(2000).nullable().optional(), active: z.boolean(), featured: z.boolean().optional(), display_order: z.number().int().min(0),
    seo_title: z.string().max(180).nullable().optional(), seo_description: z.string().max(320).nullable().optional() }),
  service_area: z.object({ name: z.string().trim().min(1).max(120), slug: slugSchema, state: z.string().trim().min(2).max(2),
    description: z.string().nullable().optional(), hero_image: z.string().max(2000).nullable().optional(), active: z.boolean(), sort_order: z.number().int().min(0),
    seo_title: z.string().max(180).nullable().optional(), seo_description: z.string().max(320).nullable().optional(), zip_codes: z.array(z.string().regex(/^\d{5}$/)).optional() }),
  testimonial: z.object({ reviewer_name: z.string().trim().min(1).max(120), reviewer_city: z.string().max(120).nullable().optional(),
    rating: z.number().int().min(1).max(5), review_text: z.string().trim().min(1).max(2000), service_name: z.string().max(120).nullable().optional(),
    date: z.string().max(40).nullable().optional(), verified: z.boolean(), source: z.enum(['google','yelp','bbb','internal']).nullable().optional(),
    active: z.boolean(), display_order: z.number().int().min(0), image_url: z.string().max(2000).nullable().optional() }),
  faq: z.object({ question: z.string().trim().min(1).max(300), answer: z.string().trim().min(1).max(3000),
    category: z.string().max(80).nullable().optional(), sort_order: z.number().int().min(0), active: z.boolean() }),
  homepage: homepageSchema,
} as const

const tableFor = { blog: 'blogs', service: 'services', service_area: 'service_areas', testimonial: 'testimonials', faq: 'faqs' } as const
type Entity = keyof typeof schemas

async function authorized() {
  const auth = await verifyAdminAuth()
  if (auth.authorized) return null
  return NextResponse.json({ error: auth.authenticated ? 'Admin authorization required.' : 'Sign in required.' }, { status: auth.authenticated ? 403 : 401 })
}

function invalidate(entity: Entity, slug?: string) {
  if (entity === 'homepage' || entity === 'testimonial' || entity === 'faq') revalidatePath('/')
  if (entity === 'blog') { revalidatePath('/blog'); if (slug) revalidatePath(`/blog/${slug}`) }
  if (entity === 'service') {
    revalidatePath('/services'); revalidatePath('/services/plumbing'); revalidatePath('/services/hvac')
    if (slug) { revalidatePath(`/services/plumbing/${slug}`); revalidatePath(`/services/hvac/${slug}`) }
  }
  if (entity === 'service_area') { revalidatePath('/service-areas'); if (slug) revalidatePath(`/service-areas/${slug}`) }
}

async function entityFrom(context: { params: Promise<{ entity: string }> }): Promise<Entity | null> {
  const { entity } = await context.params
  return entity in schemas ? entity as Entity : null
}

export async function GET(_request: NextRequest, context: { params: Promise<{ entity: string }> }) {
  const denied = await authorized(); if (denied) return denied
  const entity = await entityFrom(context)
  if (!entity) return NextResponse.json({ error: 'Unknown CMS collection.' }, { status: 404 })
  try {
    const admin = createAdminClient()
    if (entity === 'homepage') {
      const { data, error } = await admin.from('homepage_content').select('content').eq('id', 'home').single()
      if (error) throw error
      return NextResponse.json({ item: data.content })
    }
    const orderColumn = entity === 'blog' ? 'created_at' : entity === 'service' || entity === 'testimonial' ? 'display_order' : 'sort_order'
    const { data, error } = await admin.from(tableFor[entity]).select('*').order(orderColumn, { ascending: entity !== 'blog' })
    if (error) throw error
    if (entity === 'service_area' && data?.length) {
      const { data: zips, error: zipError } = await admin.from('service_area_zips').select('service_area_id,zip_code').in('service_area_id', data.map((item) => item.id))
      if (zipError) throw zipError
      const items = data.map((area) => ({ ...area, zip_codes: (zips ?? []).filter((zip) => zip.service_area_id === area.id).map((zip) => zip.zip_code).join(', ') }))
      return NextResponse.json({ items })
    }
    return NextResponse.json({ items: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database request failed.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

async function save(request: NextRequest, entity: Entity, id?: string) {
  let raw: unknown
  try { raw = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = (schemas[entity] as z.ZodType<Record<string, unknown>>).safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid content.' }, { status: 400 })
  try {
    const admin = createAdminClient()
    if (entity === 'homepage') {
      const { error } = await admin.from('homepage_content').upsert({ id: 'home', content: parsed.data, updated_at: new Date().toISOString() })
      if (error) throw error
    } else if (id) {
      const payload: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() }
      if (entity === 'service' && typeof payload.category === 'string') {
        const { data: category, error: categoryError } = await admin.from('service_categories').select('id').eq('slug', payload.category).maybeSingle()
        if (categoryError) throw categoryError
        payload.category_id = category?.id ?? null
      }
      if (entity === 'service_area') delete (payload as Record<string, unknown>).zip_codes
      const { data, error } = await admin.from(tableFor[entity]).update(payload).eq('id', id).select('id,slug').maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Content record was not found.' }, { status: 404 })
      if (entity === 'service_area' && 'zip_codes' in parsed.data) {
        const { error: removeError } = await admin.from('service_area_zips').delete().eq('service_area_id', id)
        if (removeError) throw removeError
      const zips = Array.isArray(parsed.data.zip_codes) ? parsed.data.zip_codes as string[] : []
        if (zips.length) { const { error: insertError } = await admin.from('service_area_zips').insert(zips.map((zip_code: string) => ({ service_area_id: id, zip_code }))); if (insertError) throw insertError }
      }
    } else {
      if (entity === 'service_area') {
        const payload = { ...parsed.data }
        delete (payload as Record<string, unknown>).zip_codes
        const { data, error } = await admin.from('service_areas').insert(payload).select('id').single()
        if (error) throw error
        const zips = Array.isArray(parsed.data.zip_codes) ? parsed.data.zip_codes as string[] : []
        if (zips.length) { const { error: zipError } = await admin.from('service_area_zips').insert(zips.map((zip_code: string) => ({ service_area_id: data.id, zip_code }))); if (zipError) throw zipError }
      } else {
        const payload = { ...parsed.data }
        if (entity === 'service' && typeof payload.category === 'string') {
          const { data: category, error: categoryError } = await admin.from('service_categories').select('id').eq('slug', payload.category).maybeSingle()
          if (categoryError) throw categoryError
          payload.category_id = category?.id ?? null
        }
        const { error } = await admin.from(tableFor[entity]).insert(payload as never)
        if (error) throw error
      }
    }
    const slug = typeof parsed.data.slug === 'string' ? parsed.data.slug : undefined
    invalidate(entity, slug)
    return NextResponse.json({ success: true }, { status: id ? 200 : 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database mutation failed.'
    const duplicate = /duplicate key|unique constraint/i.test(message)
    return NextResponse.json({ error: duplicate ? 'That slug is already in use.' : message }, { status: duplicate ? 409 : 503 })
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ entity: string }> }) {
  const denied = await authorized(); if (denied) return denied
  const entity = await entityFrom(context)
  if (!entity) return NextResponse.json({ error: 'Unknown CMS collection.' }, { status: 404 })
  return save(request, entity)
}

async function updateCmsEntity(request: NextRequest, entityName: string, id: string) {
  const denied = await authorized(); if (denied) return denied
  if (!(entityName in schemas) || entityName === 'homepage' || !id) return NextResponse.json({ error: 'Unknown record.' }, { status: 404 })
  const target = entityName as Exclude<Entity, 'homepage'>
  let raw: unknown
  try { raw = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = schemas[target].safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid content.' }, { status: 400 })
  try {
    const admin = createAdminClient()
    const payload: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() }
    if (target === 'service' && typeof payload.category === 'string') {
      const { data: category, error: categoryError } = await admin.from('service_categories').select('id').eq('slug', payload.category).maybeSingle()
      if (categoryError) throw categoryError
      payload.category_id = category?.id ?? null
    }
    if (target === 'service_area') delete (payload as Record<string, unknown>).zip_codes
    const { data, error } = await admin.from(tableFor[target]).update(payload).eq('id', id).select('id,slug').maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Content record was not found.' }, { status: 404 })
    if (target === 'service_area' && 'zip_codes' in parsed.data) {
      const { error: removeError } = await admin.from('service_area_zips').delete().eq('service_area_id', id)
      if (removeError) throw removeError
      const zips = parsed.data.zip_codes || []
      if (zips.length) { const { error: insertError } = await admin.from('service_area_zips').insert(zips.map((zip_code) => ({ service_area_id: id, zip_code }))); if (insertError) throw insertError }
    }
    invalidate(target, data.slug)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database mutation failed.'
    return NextResponse.json({ error: /duplicate key|unique constraint/i.test(message) ? 'That slug is already in use.' : message }, { status: /duplicate key|unique constraint/i.test(message) ? 409 : 503 })
  }
}

async function deleteCmsEntity(entityName: string, id: string) {
  const denied = await authorized(); if (denied) return denied
  if (!(entityName in tableFor) || !id) return NextResponse.json({ error: 'Unknown record.' }, { status: 404 })
  const target = entityName as keyof typeof tableFor
  try {
    const admin = createAdminClient()
    if (target === 'blog') {
      const { data, error } = await admin.from('blogs').update({ status: 'archived' satisfies BlogStatus, updated_at: new Date().toISOString() }).eq('id', id).select('slug').maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Content record was not found.' }, { status: 404 })
      invalidate('blog', data.slug)
    } else {
      const { data, error } = await admin.from(tableFor[target]).delete().eq('id', id).select('slug').maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Content record was not found.' }, { status: 404 })
      invalidate(target, data.slug)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed.'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params
  return updateCmsEntity(request, entity, request.nextUrl.searchParams.get('id') || '')
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params
  return deleteCmsEntity(entity, request.nextUrl.searchParams.get('id') || '')
}
