import { NextRequest, NextResponse } from 'next/server'
import { checkSpam, sanitizeString } from '@/lib/forms/spamProtection'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
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

    if (dbError) {
      console.warn('[PRO APPLICATIONS API] Supabase query notice:', dbError.message)
      return NextResponse.json({ applications: [], warning: dbError.message }, { status: 200 })
    }

    return NextResponse.json({ applications: applications || [] }, { status: 200 })
  } catch (error: any) {
    console.error('[PRO APPLICATIONS API GET ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Anti-spam check
    const spamCheck = checkSpam({
      honeypotValue: body.website_url_hp,
      submittedAt: body.formOpenedAt,
    })

    if (spamCheck.isSpam) {
      console.warn('[SPAM PRO APPLICATION REJECTED]', spamCheck.reason)
      return NextResponse.json({ success: true, message: 'Application received' }, { status: 200 })
    }

    // 2. Validate essential fields
    if (!body.name || !body.phone || !body.email || !body.trade) {
      return NextResponse.json(
        { error: 'Missing required applicant fields (Name, Phone, Email, Trade)' },
        { status: 400 }
      )
    }

    const applicationRecord = {
      application_id: `PA-${randomUUID()}`,
      name: sanitizeString(body.name),
      company: sanitizeString(body.company) || null,
      phone: sanitizeString(body.phone),
      email: sanitizeString(body.email),
      trade: body.trade, // 'plumbing' | 'hvac' | 'both' | 'other'
      experience: sanitizeString(String(body.experience ?? body.years_experience ?? '')) || null,
      license_info: sanitizeString(body.licenseInfo) || null,
      insurance_info: sanitizeString(body.insuranceInfo) || null,
      website: sanitizeString(body.website) || null,
      service_areas: body.serviceAreas || [],
      message: sanitizeString(body.message) || null,
      document_name: sanitizeString(body.documentName) || null,
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
