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
    const { data: quotes, error: dbError } = await supabase
      .from('leads')
      .select('*')
      .eq('lead_type', 'quote_request')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.warn('[QUOTE API] Supabase query notice:', dbError.message)
      return NextResponse.json({ quotes: [], warning: dbError.message }, { status: 200 })
    }

    return NextResponse.json({ quotes: quotes || [] }, { status: 200 })
  } catch (error: any) {
    console.error('[QUOTE API GET ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve quotes' },
      { status: 500 }
    )
  }
}

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
      lead_id: `QT-${randomUUID()}`,
      name: sanitizeString(body.name),
      phone: sanitizeString(body.phone),
      email: sanitizeString(body.email) || null,
      service_category: sanitizeString(body.serviceCategory || 'general'),
      specific_service: sanitizeString(body.specificService) || null,
      zip_code: sanitizeString(body.zipCode),
      message: sanitizeString(body.message) || sanitizeString(body.projectType) || null,
      preferred_time: sanitizeString(body.preferredDate) || null,
      lead_type: 'quote_request',
      status: 'new',
    }

    const supabase = await createClient()
    const { error: insertError } = await supabase.from('leads').insert([quoteRecord])
    if (insertError) {
      console.error('[QUOTE API] Database insert failed:', insertError.message)
      return NextResponse.json({ error: 'We could not save your quote request. Please try again.' }, { status: 503 })
    }

    const quoteId = `QT-${Date.now().toString().slice(-6)}`
    console.log('[QUOTE REQUEST RECORDED]', { quoteId, ...quoteRecord })

    return NextResponse.json(
      {
        success: true,
        quoteId,
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
