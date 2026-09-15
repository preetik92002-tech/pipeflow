import { NextRequest, NextResponse } from 'next/server'
import { checkSpam, sanitizeString } from '@/lib/forms/spamProtection'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Anti-spam verification
    const spamCheck = checkSpam({
      honeypotValue: body.website_url_hp,
      submittedAt: body.formOpenedAt,
    })

    if (spamCheck.isSpam) {
      console.warn('[SPAM BOOKING REJECTED]', spamCheck.reason)
      // Return 200 to confuse bots without storing spam
      return NextResponse.json({ success: true, message: 'Booking received' }, { status: 200 })
    }

    // 2. Validate essential fields
    if (!body.name || !body.phone || !body.serviceCategory || !body.zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields (Name, Phone, Category, ZIP code)' },
        { status: 400 }
      )
    }

    const bookingRecord = {
      booking_id: `BK-${Date.now().toString().slice(-6)}`,
      name: sanitizeString(body.name),
      phone: sanitizeString(body.phone),
      email: sanitizeString(body.email) || null,
      service_category: body.serviceCategory,
      specific_service: body.specificService,
      address: sanitizeString(body.address) || null,
      zip_code: sanitizeString(body.zipCode),
      preferred_date: body.preferredDate || null,
      preferred_time: body.preferredTime || null,
      problem_description: sanitizeString(body.problemDescription) || null,
      is_emergency: Boolean(body.isEmergency),
      status: 'requested',
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

    console.log('[NEW BOOKING REQUEST RECEIVED]', bookingRecord)

    return NextResponse.json(
      {
        success: true,
        bookingId: bookingRecord.booking_id,
        message:
          'Your requested service window has been logged. A PipeFlow dispatch coordinator will contact you shortly to confirm.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[BOOKING API ERROR]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
