import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminAuth } from '@/lib/supabase/auth'

const leadStatuses = ['new', 'contacted', 'qualified', 'scheduled', 'in_progress', 'closed_won', 'closed_lost', 'spam'] as const

async function authorize() {
  const auth = await verifyAdminAuth()
  if (!auth.authorized) return { auth, response: NextResponse.json({ error: auth.authenticated ? 'Admin authorization required.' : 'Sign in required.' }, { status: auth.authenticated ? 403 : 401 }) }
  return { auth, response: null }
}

export async function GET() {
  const { response } = await authorize()
  if (response) return response
  try {
    const admin = createAdminClient()
    const [leadResult, bookingResult] = await Promise.all([
      admin.from('leads').select('*,lead_notes(id,content,created_at)').order('created_at', { ascending: false }),
      admin.from('bookings').select('*').order('created_at', { ascending: false }),
    ])
    if (leadResult.error) throw leadResult.error
    if (bookingResult.error) throw bookingResult.error
    const leads = (leadResult.data ?? []).map((lead) => ({ ...lead, record_kind: 'lead' }))
    const bookings = (bookingResult.data ?? []).map((booking) => ({
      id: booking.id, lead_id: booking.booking_id, name: booking.name, phone: booking.phone, email: booking.email,
      service_category: booking.service_category, specific_service: booking.specific_service, zip_code: booking.zip_code,
      message: booking.problem_description, preferred_date: booking.preferred_date, preferred_time: booking.preferred_time,
      is_emergency: booking.is_emergency, status: booking.status, lead_type: 'booking_request', created_at: booking.created_at,
      utm_source: booking.utm_source, utm_medium: booking.utm_medium, utm_campaign: booking.utm_campaign,
      gclid: booking.gclid, fbclid: booking.fbclid, record_kind: 'booking', lead_notes: [],
    }))
    return NextResponse.json({ leads: [...leads, ...bookings].sort((a, b) => Date.parse(b.created_at || '') - Date.parse(a.created_at || '')) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load leads.' }, { status: 503 })
  }
}

const updateSchema = z.object({
  status: z.string().min(1).max(30).optional(),
  recordKind: z.enum(['lead', 'booking']).optional(),
  note: z.string().trim().min(1).max(2000).optional(),
}).refine((value) => value.status !== undefined || value.note !== undefined, 'Provide a status or an internal note.')

export async function PATCH(request: NextRequest) {
  const { auth, response } = await authorize()
  if (response) return response
  const id = request.nextUrl.searchParams.get('id')
  if (!id || !z.string().uuid().safeParse(id).success) return NextResponse.json({ error: 'A valid lead record ID is required.' }, { status: 400 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid lead update.' }, { status: 400 })
  try {
    const admin = createAdminClient()
    const kind = parsed.data.recordKind || 'lead'
    if (parsed.data.status) {
      const validStatus = kind === 'lead' ? leadStatuses.includes(parsed.data.status as typeof leadStatuses[number]) : ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(parsed.data.status)
      if (!validStatus) return NextResponse.json({ error: 'Unsupported status for this record.' }, { status: 400 })
      const table = kind === 'lead' ? 'leads' : 'bookings'
      const { data, error } = await admin.from(table).update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq('id', id).select('id').maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Lead was not found.' }, { status: 404 })
    }
    if (parsed.data.note) {
      if (kind !== 'lead') return NextResponse.json({ error: 'Internal notes are available for leads only.' }, { status: 400 })
      const { data: lead, error: leadError } = await admin.from('leads').select('id').eq('id', id).maybeSingle()
      if (leadError) throw leadError
      if (!lead) return NextResponse.json({ error: 'Lead was not found.' }, { status: 404 })
      const { error } = await admin.from('lead_notes').insert({ lead_id: id, author_id: auth.user?.id ?? null, content: parsed.data.note })
      if (error) throw error
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update lead.' }, { status: 503 })
  }
}
