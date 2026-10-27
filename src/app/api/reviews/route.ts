import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkSpam, checkRateLimit, sanitizeString } from '@/lib/forms/spamProtection'
import { REVIEW_MIN_LENGTH, reviewSchema } from '@/lib/reviews/schema'

/**
 * A customer's review from /reviews. It is saved hidden and only goes live once an admin approves it in
 * Admin > Customer Reviews, so nothing a visitor types is published unchecked. The email is stored privately
 * (review_submissions) and is never shown.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`review:${ip}`, 3, 600)
  if (!rate.allowed) return NextResponse.json({ error: 'Too many reviews from this connection. Please try again later.' }, { status: 429 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Please check your review.' }, { status: 400 })
  const fields = parsed.data
  const spam = checkSpam({ honeypotValue: fields.website_url_hp, submittedAt: fields.formOpenedAt, minimumSeconds: 5 })
  if (spam.isSpam) return NextResponse.json({ success: true }, { status: 201 })
  const text = sanitizeString(fields.text)
  const name = sanitizeString(fields.name)
  if (text.length < REVIEW_MIN_LENGTH || name.length < 2) return NextResponse.json({ error: 'Please check your review.' }, { status: 400 })
  try {
    const { data, error } = await createAdminClient().rpc('submit_customer_review', {
      p_name: name,
      p_city: sanitizeString(fields.city),
      p_rating: fields.rating,
      p_text: text,
      p_service: sanitizeString(fields.service),
      p_email: fields.email,
    })
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'You already sent a review in the last 24 hours. Thank you!' }, { status: 409 })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[reviews POST]', error instanceof Error ? error.message : (error as { message?: string })?.message)
    return NextResponse.json({ error: 'We could not save your review. Please try again.' }, { status: 503 })
  }
}
