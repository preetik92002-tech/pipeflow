import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { checkSpam, checkRateLimit, sanitizeString } from '@/lib/forms/spamProtection'

const formSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(30).regex(/^[+()\d.\-\s]+$/, 'Enter a valid phone number.'),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
  serviceCategory: z.string().trim().max(80).optional(),
  serviceType: z.string().trim().max(120).optional(),
  specificService: z.string().trim().max(120).optional(),
  zipCode: z.string().trim().regex(/^\d{5}$/).optional().or(z.literal('')),
  serviceArea: z.string().trim().max(120).optional(),
  message: z.string().max(5000).optional(),
  preferredDate: z.string().max(80).optional(), photoName: z.string().max(250).optional(), photoSize: z.number().int().min(0).max(10 * 1024 * 1024).optional(),
  preferredTime: z.string().max(120).optional(),
  isEmergency: z.boolean().optional(),
  website_url_hp: z.string().max(500).optional(),
  formOpenedAt: z.string().datetime().optional(),
  utm_source: z.string().max(250).optional(), utm_medium: z.string().max(250).optional(),
  utm_campaign: z.string().max(250).optional(), utm_term: z.string().max(250).optional(),
  utm_content: z.string().max(250).optional(), gclid: z.string().max(1000).optional(),
  fbclid: z.string().max(1000).optional(), referrer: z.string().max(2000).optional(),
  landingPage: z.string().max(2000).optional(), landing_page: z.string().max(2000).optional(),
  utmSource: z.string().max(250).optional(), utmMedium: z.string().max(250).optional(), utmCampaign: z.string().max(250).optional(),
  utmTerm: z.string().max(250).optional(), utmContent: z.string().max(250).optional(),
}).passthrough()

export async function GET() {
  const auth = await verifyAdminAuth()
  if (!auth.authenticated) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  if (!auth.authorized) return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 })
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ leads: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load leads.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', 8, 60)
  if (!rate.allowed) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = formSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Please check the submitted details.' }, { status: 400 })
  const fields = parsed.data
  if (!fields.serviceCategory && !fields.serviceType) return NextResponse.json({ error: 'Choose a service category.' }, { status: 400 })
  const spam = checkSpam({ honeypotValue: fields.website_url_hp, submittedAt: fields.formOpenedAt })
  if (spam.isSpam) return NextResponse.json({ success: true, message: 'Request received' }, { status: 200 })
  const clean = (value: string | undefined) => value ? sanitizeString(value) : ''
  const category = clean(fields.serviceCategory) || clean(fields.serviceType)
  const record = {
    lead_id: `LD-${randomUUID()}`, name: sanitizeString(fields.name), phone: sanitizeString(fields.phone),
    email: clean(fields.email) || null, service_category: category,
    specific_service: clean(fields.specificService) || clean(fields.serviceType) || null,
    zip_code: clean(fields.zipCode) || null, service_area: clean(fields.serviceArea) || null,
    message: clean(fields.message) || null, preferred_date: clean(fields.preferredDate) || null,
    preferred_time: clean(fields.preferredTime) || null, photo_name: clean(fields.photoName) || null, photo_size: fields.photoSize ?? null,
    is_emergency: fields.isEmergency ?? false,
    lead_type: fields.serviceType && !fields.serviceCategory ? 'contact' : 'service_request',
    status: 'new', utm_source: clean(fields.utm_source || fields.utmSource) || null, utm_medium: clean(fields.utm_medium || fields.utmMedium) || null,
    utm_campaign: clean(fields.utm_campaign || fields.utmCampaign) || null, utm_term: clean(fields.utm_term || fields.utmTerm) || null,
    utm_content: clean(fields.utm_content || fields.utmContent) || null, gclid: clean(fields.gclid) || null,
    fbclid: clean(fields.fbclid) || null, referrer: clean(fields.referrer) || null,
    landing_page: clean(fields.landingPage || fields.landing_page) || null,
  }
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('leads').insert(record)
    if (error) throw error
    return NextResponse.json({ success: true, message: 'Your service request has been received.' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'We could not save your request. Please try again or call us.' }, { status: 503 })
  }
}
