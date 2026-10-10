import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, checkSpam, sanitizeString } from '@/lib/forms/spamProtection'
import { IMAGE_MAX, VIDEO_MAX, sniffType } from '@/lib/requests/files'
import { requestSchema, serviceLabel } from '@/lib/requests/schema'

const BUCKET = 'service-requests'
const clean = (v?: string | null) => (v ? sanitizeString(v) : '')

/** Keeps only attachments that really are in storage, are within size limits and whose bytes match an allowed type. */
async function verifiedAttachments(paths: string[]): Promise<{ kept: string[]; firstName: string | null; firstSize: number | null }> {
  const storage = createAdminClient().storage.from(BUCKET)
  const kept: string[] = []
  let firstName: string | null = null
  let firstSize: number | null = null
  for (const path of paths) {
    try {
      const [folder, name] = path.split('/')
      const { data: listed } = await storage.list(folder, { limit: 20, search: name })
      const info = listed?.find((f) => f.name === name)
      const size = Number((info?.metadata as { size?: number } | undefined)?.size ?? 0)
      if (!info || size < 12) throw new Error('missing')
      const mime = String((info.metadata as { mimetype?: string } | undefined)?.mimetype ?? '')
      if (mime.startsWith('video/')) {
        if (size > VIDEO_MAX) throw new Error('too large')
      } else {
        if (size > IMAGE_MAX) throw new Error('too large')
      }
      const { data: blob, error } = await storage.download(path)
      if (error || !blob) throw new Error('download failed')
      const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer())
      const kind = sniffType(head)
      if (!kind || (kind === 'video') !== mime.startsWith('video/')) throw new Error('type mismatch')
      kept.push(path)
      firstName ??= name
      firstSize ??= size
    } catch {
      await storage.remove([path]).catch(() => undefined)
    }
  }
  return { kept, firstName, firstSize }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`request:${ip}`, 6, 600)
  if (!rate.allowed) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return NextResponse.json({ error: issue?.message || 'Please check your details.', field: issue?.path.join('.') }, { status: 400 })
  }
  const r = parsed.data
  // Bots get the same answer as people, but nothing is saved.
  if (checkSpam({ honeypotValue: r.website_url_hp, submittedAt: r.formOpenedAt }).isSpam) return NextResponse.json({ success: true }, { status: 200 })

  const files = r.attachments.length ? await verifiedAttachments(r.attachments) : { kept: [], firstName: null, firstSize: null }
  const business = r.customerType === 'business' && r.business
    ? { name: clean(r.business.name), propertyType: clean(r.business.propertyType), equipment: clean(r.business.equipment) }
    : null

  const reference = `LD-${randomUUID()}`
  const record = {
    lead_id: reference,
    name: clean(r.name),
    phone: clean(r.phone),
    email: clean(r.email),
    service_category: r.category === 'plumbing' ? 'Plumbing' : 'HVAC',
    specific_service: serviceLabel(r.service),
    service_area: r.city,
    zip_code: r.zip,
    address: clean(r.address),
    message: clean(r.description),
    preferred_date: r.preferredDate || null,
    preferred_time: r.preferredWindow,
    is_emergency: r.urgency === 'emergency',
    urgency: r.urgency,
    customer_type: r.customerType,
    details: business ? { business } : {},
    attachments: files.kept,
    photo_name: files.firstName,
    photo_size: files.firstSize,
    lead_type: 'service_request',
    status: 'new',
    utm_source: clean(r.utm_source) || null, utm_medium: clean(r.utm_medium) || null, utm_campaign: clean(r.utm_campaign) || null,
    utm_term: clean(r.utm_term) || null, utm_content: clean(r.utm_content) || null, gclid: clean(r.gclid) || null,
    fbclid: clean(r.fbclid) || null, referrer: clean(r.referrer) || null, landing_page: clean(r.landingPage) || null,
  }
  const { error } = await createAdminClient().from('leads').insert(record)
  if (error) {
    console.error('[service-requests]', error.message)
    return NextResponse.json({ error: 'We could not save your request. Please try again.' }, { status: 503 })
  }
  return NextResponse.json({ success: true, reference: reference.slice(3, 11).toUpperCase(), attachments: files.kept.length }, { status: 201 })
}
