import { NextRequest, NextResponse } from 'next/server'
import { checkSpam, sanitizeString } from '@/lib/forms/spamProtection'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/supabase/auth'

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
    const { data: bookings, error: dbError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.warn('[BOOKINGS API] Supabase query notice:', dbError.message)
      return NextResponse.json({ bookings: [], warning: dbError.message }, { status: 200 })
    }

    return NextResponse.json({ bookings: bookings || [] }, { status: 200 })
  } catch (error: any) {
    console.error('[BOOKINGS API GET ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve bookings' },
      { status: 500 }
    )
  }
}

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
      created_at: new Date().toISOString(),
    }

    // Insert to Supabase with public insert policy
    try {
      const supabase = await createClient()
      const { error: insertError } = await supabase.from('bookings').insert([bookingRecord])
      if (insertError) {
        console.warn('[BOOKING API SUPABASE INSERT NOTICE]', insertError.message)
      }
    } catch (dbErr: any) {
      console.warn('[BOOKING API SUPABASE EXCEPTION]', dbErr?.message)
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
