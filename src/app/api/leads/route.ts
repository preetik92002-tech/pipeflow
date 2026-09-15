import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate core contact and service fields
    if (!body.name || !body.phone || !body.serviceCategory || !body.zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields (Name, Phone, Service Category, ZIP code)' },
        { status: 400 }
      )
    }

    const leadRecord = {
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      service_category: body.serviceCategory,
      specific_service: body.specificService || 'general',
      zip_code: body.zipCode,
      preferred_time: body.preferredTime || null,
      preferred_date: body.preferredDate || null,
      message: body.message || null,
      photo_name: body.photoName || null,
      photo_size: body.photoSize || null,
      is_emergency: Boolean(body.isEmergency),
      // Attribution & Marketing Tracking
      utm_source: body.utmSource || null,
      utm_medium: body.utmMedium || null,
      utm_campaign: body.utmCampaign || null,
      utm_term: body.utmTerm || null,
      utm_content: body.utmContent || null,
      gclid: body.gclid || null,
      fbclid: body.fbclid || null,
      referrer: body.referrer || null,
      landing_page: body.landingPage || null,
      created_at: body.submittedAt || new Date().toISOString(),
      status: 'new',
      source: 'website_homepage',
    }

    // TODO: When Supabase credentials are configured in .env.local:
    // const supabase = await createClient()
    // const { error } = await supabase.from('leads').insert([leadRecord])
    // if (error) throw error

    console.log('[LEAD SUBMISSION SUCCESS]', leadRecord)

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
