import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { checkSpam, checkRateLimit, sanitizeString } from '@/lib/forms/spamProtection'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // 1. Server-side Authentication & Role Verification
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

    // 2. Fetch leads from Supabase with user's authenticated session
    const supabase = await createClient()
    const { data: leads, error: dbError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.warn('[LEADS API] Supabase query error:', dbError.message)
      return NextResponse.json({ leads: [], warning: dbError.message }, { status: 200 })
    }

    return NextResponse.json({ leads: leads || [] }, { status: 200 })
  } catch (error: any) {
    console.error('[LEADS API GET ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const spamCheck = checkSpam({ honeypotValue: body.website_url_hp, submittedAt: body.formOpenedAt })
    if (spamCheck.isSpam) return NextResponse.json({ success: true, message: 'Request received' }, { status: 200 })
    const rateLimit = checkRateLimit(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown', 8, 60)
    if (!rateLimit.allowed) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })

    // Validate core contact and service fields
    if (!body.name || !body.phone || !(body.serviceCategory || body.serviceType)) {
      return NextResponse.json(
        { error: 'Missing required fields (Name, Phone, Service Category, ZIP code)' },
        { status: 400 }
      )
    }

    const leadRecord = {
      lead_id: `LD-${randomUUID()}`,
      name: sanitizeString(body.name),
      phone: sanitizeString(body.phone),
      email: sanitizeString(body.email) || null,
      service_category: sanitizeString(body.serviceCategory || body.serviceType || 'general'),
      specific_service: sanitizeString(body.specificService || body.serviceType) || null,
      zip_code: sanitizeString(body.zipCode) || null,
      service_area: sanitizeString(body.serviceArea || body.zipCode) || null,
      message: sanitizeString(body.message) || null,
      preferred_time: sanitizeString(body.preferredTime) || null,
      is_emergency: Boolean(body.isEmergency),
      lead_type: body.serviceType ? 'contact' : 'service_request',
      status: 'new',
    }

    const supabase = await createClient()
    const { error: insertError } = await supabase.from('leads').insert([leadRecord])
    if (insertError) {
      console.error('[LEAD API] Database insert failed:', insertError.message)
      return NextResponse.json({ error: 'We could not save your request. Please try again or call us.' }, { status: 503 })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your service request has been received. Our Denver dispatch team will contact you shortly.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[LEAD API ERROR]', error)
    return NextResponse.json({ error: 'Internal server error processing lead' }, { status: 500 })
  }
}
