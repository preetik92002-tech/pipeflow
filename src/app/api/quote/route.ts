import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { checkRateLimit, checkSpam, sanitizeString } from '@/lib/forms/spamProtection'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/supabase/auth'

const schema = z.object({
  name: z.string().trim().min(1).max(120), phone: z.string().trim().min(7).max(30).regex(/^[+()\d.\-\s]+$/),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
  serviceCategory: z.string().trim().max(80).optional(), category: z.string().trim().max(80).optional(),
  specificService: z.string().trim().max(120).optional(), zipCode: z.string().trim().regex(/^\d{5}$/),
  preferredDate: z.string().max(80).optional(), projectType: z.string().max(100).optional(),
  propertyType: z.string().max(100).optional(), preferredContactMethod: z.string().max(50).optional(),
  message: z.string().max(5000).optional(), website_url_hp: z.string().max(500).optional(), formOpenedAt: z.string().datetime().optional(),
  utm_source: z.string().max(250).optional(), utm_medium: z.string().max(250).optional(), utm_campaign: z.string().max(250).optional(),
  gclid: z.string().max(1000).optional(), fbclid: z.string().max(1000).optional(),
}).passthrough()

export async function GET() {
  const auth = await verifyAdminAuth()
  if (!auth.authenticated) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  if (!auth.authorized) return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 })
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('leads').select('*').eq('lead_type', 'quote_request').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ quotes: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load quotes.' }, { status: 503 }) }
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', 5, 60)
  if (!rate.allowed) return NextResponse.json({ error: 'Too many submissions. Please try again shortly.' }, { status: 429 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Please check your quote details.' }, { status: 400 })
  const fields = parsed.data
  const category = fields.serviceCategory || fields.category
  if (!category) return NextResponse.json({ error: 'Choose a service category.' }, { status: 400 })
  const spam = checkSpam({ honeypotValue: fields.website_url_hp, submittedAt: fields.formOpenedAt })
  if (spam.isSpam) return NextResponse.json({ success: true, message: 'Quote received' }, { status: 200 })
  const clean = (value: string | undefined) => value ? sanitizeString(value) : ''
  const record = {
    lead_id: `QT-${randomUUID()}`, name: sanitizeString(fields.name), phone: sanitizeString(fields.phone), email: clean(fields.email) || null,
    service_category: sanitizeString(category), specific_service: clean(fields.specificService) || null,
    zip_code: sanitizeString(fields.zipCode), message: clean(fields.message) || clean(fields.projectType) || null,
    preferred_date: clean(fields.preferredDate) || null, preferred_time: clean(fields.preferredContactMethod) || null,
    lead_type: 'quote_request', status: 'new', utm_source: clean(fields.utm_source) || null,
    utm_medium: clean(fields.utm_medium) || null, utm_campaign: clean(fields.utm_campaign) || null,
    gclid: clean(fields.gclid) || null, fbclid: clean(fields.fbclid) || null,
  }
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('leads').insert(record)
    if (error) throw error
    return NextResponse.json({ success: true, quoteId: record.lead_id, message: 'Your quote request has been received.' }, { status: 201 })
  } catch { return NextResponse.json({ error: 'We could not save your quote request. Please try again.' }, { status: 503 }) }
}
