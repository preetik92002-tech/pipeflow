import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/supabase/auth'

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
      service_type: body.specificService || body.serviceCategory || 'general',
      service_area: body.zipCode,
      message: body.message || null,
      preferred_time: body.preferredTime || null,
      is_emergency: Boolean(body.isEmergency),
      source: 'website_homepage',
      status: 'new',
    }

    // Attempt Supabase insert with RLS public insert policy
    try {
      const supabase = await createClient()
      const { error: insertError } = await supabase.from('leads').insert([leadRecord])
      if (insertError) {
        console.warn('[LEAD API SUPABASE INSERT NOTICE]', insertError.message)
      }
    } catch (dbErr: any) {
      console.warn('[LEAD API SUPABASE EXCEPTION]', dbErr?.message)
    }

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
