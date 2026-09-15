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
    const { data: quotes, error: dbError } = await supabase
      .from('quote_requests')
      .select('*')
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
      name: sanitizeString(body.name),
      phone: sanitizeString(body.phone),
      email: sanitizeString(body.email) || null,
      service_type: body.specificService || body.serviceCategory || 'general',
      description: sanitizeString(body.message) || sanitizeString(body.projectType) || null,
      preferred_date: body.preferredDate || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    try {
      const supabase = await createClient()
      const { error: insertError } = await supabase.from('quote_requests').insert([quoteRecord])
      if (insertError) {
        console.warn('[QUOTE API SUPABASE INSERT NOTICE]', insertError.message)
      }
    } catch (dbErr: any) {
      console.warn('[QUOTE API SUPABASE EXCEPTION]', dbErr?.message)
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
