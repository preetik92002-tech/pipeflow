import { NextRequest, NextResponse } from 'next/server'
import { checkSpam, sanitizeString } from '@/lib/forms/spamProtection'

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
      application_id: `PRO-${Date.now().toString().slice(-6)}`,
      name: sanitizeString(body.name),
      company: sanitizeString(body.company) || null,
      phone: sanitizeString(body.phone),
      email: sanitizeString(body.email),
      trade: body.trade, // 'plumbing' | 'hvac' | 'both'
      experience: body.experience || '2-5 years',
      service_areas: body.serviceAreas || [],
      license_info: sanitizeString(body.licenseInfo) || null,
      insurance_info: sanitizeString(body.insuranceInfo) || null,
      website: sanitizeString(body.website) || null,
      message: sanitizeString(body.message) || null,
      document_name: body.documentName || null,
      status: 'new', // new, under_review, contacted, approved, rejected, onboarding
      created_at: new Date().toISOString(),
    }

    console.log('[NEW PRO APPLICATION RECORDED]', applicationRecord)

    return NextResponse.json(
      {
        success: true,
        applicationId: applicationRecord.application_id,
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
