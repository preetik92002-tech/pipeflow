import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const seoSchema = z.object({
  default_title: z.string().trim().min(1).max(120), title_template: z.string().trim().min(1).max(180).refine((v) => v.includes('%s'), 'Title template must include %s.'),
  default_description: z.string().trim().min(1).max(320), canonical_domain: z.string().url().max(300), default_og_image: z.string().max(2000),
  homepage_title: z.string().max(120), homepage_description: z.string().max(320), keywords: z.array(z.string().trim().min(1).max(80)).max(50), robots_txt_custom: z.string().max(5000),
})

async function denied() {
  const auth = await verifyAdminAuth()
  if (auth.authorized) return null
  return NextResponse.json({ error: auth.authenticated ? 'Admin authorization required.' : 'Sign in required.' }, { status: auth.authenticated ? 403 : 401 })
}

export async function GET() {
  const response = await denied()
  if (response) return response
  try {
    const { data, error } = await createAdminClient().from('seo_settings').select('*').limit(1).maybeSingle()
    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load SEO settings.' }, { status: 503 })
  }
}

export async function PUT(request: NextRequest) {
  const response = await denied()
  if (response) return response
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = seoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid SEO settings.' }, { status: 400 })
  try {
    const db = createAdminClient()
    const current = await db.from('seo_settings').select('id').limit(1).maybeSingle()
    if (current.error) throw current.error
    const payload = { ...parsed.data, canonical_domain: new URL(parsed.data.canonical_domain).origin, updated_at: new Date().toISOString() }
    const result = current.data
      ? await db.from('seo_settings').update(payload).eq('id', current.data.id)
      : await db.from('seo_settings').insert(payload)
    if (result.error) throw result.error
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save SEO settings.' }, { status: 503 })
  }
}
