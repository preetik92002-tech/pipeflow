import { NextRequest, NextResponse } from 'next/server'
import { checkSpam, sanitizeString } from '@/lib/forms/spamProtection'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Spam check
    const spamCheck = checkSpam({
      honeypotValue: body.website_url_hp,
      submittedAt: body.formOpenedAt,
    })

    if (spamCheck.isSpam) {
      console.warn('[SPAM QUOTE REJECTED]', spamCheck.reason)
      return NextResponse.json({ success: true, message: 'Quote received' }, { status: 200 })
    }

    // 2. Validate essential fields
    if (!body.name || !body.phone || !body.zipCode || !body.serviceCategory) {
      return NextResponse.json(
        { error: 'Missing required fields (Name, Phone, ZIP Code, Service)' },
        { status: 400 }
      )
    }

    const quoteRecord = {
      quote_id: `QT-${Date.now().toString().slice(-6)}`,
      name: sanitizeString(body.name),
      phone: sanitizeString(body.phone),
      email: sanitizeString(body.email) || null,
      zip_code: sanitizeString(body.zipCode),
      service_category: body.serviceCategory,
      specific_service: body.specificService || 'general',
      project_type: body.projectType || 'repair',
      property_type: body.propertyType || 'single-family',
      preferred_contact_method: body.preferredContactMethod || 'phone',
      message: sanitizeString(body.message) || null,
      photo_name: body.photoName || null,
      photo_size: body.photoSize || null,
      status: 'pending_review',
      // Attribution
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      gclid: body.gclid || null,
      fbclid: body.fbclid || null,
      referrer: body.referrer || null,
      landing_page: body.landing_page || null,
      created_at: new Date().toISOString(),
    }

    console.log('[QUOTE REQUEST RECORDED]', quoteRecord)

    return NextResponse.json(
      {
        success: true,
        quoteId: quoteRecord.quote_id,
        message:
          'Your quote request has been received. A PipeFlow specialist will review your project details and reach out with transparent pricing.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[QUOTE API ERROR]', error)
    return NextResponse.json({ error: 'Internal server error processing quote' }, { status: 500 })
  }
}
