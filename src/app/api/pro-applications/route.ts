import { NextRequest, NextResponse } from 'next/server'
import { checkSpam, sanitizeString } from '@/lib/forms/spamProtection'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/forms/spamProtection'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const authResult = await verifyAdminAuth()
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Session missing or invalid' },
        { status: 401 }
      )
    }

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Forbidden: Admin authorization required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const { data: applications, error: dbError } = await supabase
      .from('pro_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) throw dbError

    return NextResponse.json({ applications: applications || [] }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to retrieve applications' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', 5, 60)
    if (!rate.allowed) return NextResponse.json({ error: 'Too many submissions. Please try again shortly.' }, { status: 429 })
    const body: unknown = await request.json()
    const schema = z.object({
      name: z.string().trim().min(1).max(120), company: z.string().max(160).optional(),
      phone: z.string().trim().min(7).max(30).regex(/^[+()\d.\-\s]+$/), email: z.string().trim().email().max(254),
      trade: z.enum(['plumbing', 'hvac', 'both']), experience: z.string().max(100).optional(),
      serviceAreas: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
      licenseInfo: z.string().max(500).optional(), insuranceInfo: z.string().max(500).optional(),
      website: z.string().max(2000).optional(), message: z.string().max(5000).optional(), documentName: z.string().max(250).optional(),
      website_url_hp: z.string().max(500).optional(), formOpenedAt: z.string().datetime().optional(),
    })
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Please check the application details.' }, { status: 400 })
    const fields = parsed.data

    // 1. Anti-spam check
    const spamCheck = checkSpam({ honeypotValue: fields.website_url_hp, submittedAt: fields.formOpenedAt })

    if (spamCheck.isSpam) {
      console.warn('[SPAM PRO APPLICATION REJECTED]', spamCheck.reason)
      return NextResponse.json({ success: true, message: 'Application received' }, { status: 200 })
    }

    const applicationRecord = {
      application_id: `PA-${randomUUID()}`,
      name: sanitizeString(fields.name), company: sanitizeString(fields.company) || null,
      phone: sanitizeString(fields.phone), email: sanitizeString(fields.email), trade: fields.trade,
      experience: sanitizeString(fields.experience) || null,
      license_info: sanitizeString(fields.licenseInfo) || null,
      insurance_info: sanitizeString(fields.insuranceInfo) || null,
      website: sanitizeString(fields.website) || null,
      service_areas: (fields.serviceAreas ?? []).map((area) => sanitizeString(area)),
      message: sanitizeString(fields.message) || null,
      document_name: sanitizeString(fields.documentName) || null,
      status: 'new',
    }

    const supabase = await createClient()
    const { error: insertError } = await supabase.from('pro_applications').insert([applicationRecord])
    if (insertError) {
      console.error('[PRO APPLICATION API] Database insert failed:', insertError.message)
      return NextResponse.json({ error: 'We could not save your application. Please try again.' }, { status: 503 })
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Your trade professional application has been submitted to PipeFlow contractor relations. We will review your credentials and contact you.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[PRO APPLICATION API ERROR]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const statusSchema = z.enum(['new', 'under_review', 'contacted', 'approved', 'rejected', 'onboarding'])

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminAuth()
  if (!auth.authenticated) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  if (!auth.authorized) return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 })
  const id = request.nextUrl.searchParams.get('id')
  if (!id || !z.string().uuid().safeParse(id).success) return NextResponse.json({ error: 'A valid application record ID is required.' }, { status: 400 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = z.object({ status: statusSchema }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Unsupported application status.' }, { status: 400 })
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.from('pro_applications').update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq('id', id).select('id').maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Application was not found.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update application.' }, { status: 503 })
  }
}
