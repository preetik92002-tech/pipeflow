import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const settingsSchema = z.object({
  company: z.object({ name: z.string().trim().min(1).max(160), phone: z.string().trim().min(1).max(50), email: z.string().email().max(254), address: z.string().max(200), city: z.string().max(100), state: z.string().max(2), zip: z.string().max(10), license: z.string().max(120) }),
  banner: z.object({ enabled: z.boolean(), messages: z.array(z.string().max(300)).max(10) }),
  analytics: z.object({ ga_measurement_id: z.string().max(40), google_ads_id: z.string().max(40), google_ads_conversion_label: z.string().max(100), meta_pixel_id: z.string().max(40), tracking_enabled: z.boolean() }),
  hours: z.object({ weekday: z.string().max(120), weekend: z.string().max(120), emergency_available: z.boolean() }),
})

async function requireAdmin() {
  const result = await verifyAdminAuth()
  if (result.authorized) return null
  return NextResponse.json({ error: result.authenticated ? 'Admin authorization required.' : 'Sign in required.' }, { status: result.authenticated ? 403 : 401 })
}

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const db = createAdminClient()
    const [settings, analytics] = await Promise.all([
      db.from('site_settings').select('setting_key,setting_value').in('setting_key', ['company_info', 'emergency_banner', 'operating_hours']),
      db.from('analytics_settings').select('*').limit(1).maybeSingle(),
    ])
    if (settings.error) throw settings.error
    if (analytics.error) throw analytics.error
    const values = Object.fromEntries((settings.data ?? []).map((row) => [row.setting_key, row.setting_value as Record<string, unknown>]))
    return NextResponse.json({
      company: values.company_info ?? {}, banner: values.emergency_banner ?? {}, hours: values.operating_hours ?? {},
      analytics: analytics.data ?? {},
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load site settings.' }, { status: 503 })
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied
  let input: unknown
  try { input = await request.json() } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }) }
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid settings.' }, { status: 400 })
  try {
    const db = createAdminClient()
    const { company, banner, hours, analytics } = parsed.data
    const settingRows = [
      { setting_key: 'company_info', setting_value: company },
      { setting_key: 'emergency_banner', setting_value: { enabled: banner.enabled, messages: banner.messages } },
      { setting_key: 'operating_hours', setting_value: hours },
    ]
    const savedSettings = await db.from('site_settings').upsert(settingRows, { onConflict: 'setting_key' })
    if (savedSettings.error) throw savedSettings.error
    const current = await db.from('analytics_settings').select('id').limit(1).maybeSingle()
    if (current.error) throw current.error
    const analyticsPayload = {
      ga_measurement_id: analytics.ga_measurement_id || null, google_ads_id: analytics.google_ads_id || null,
      google_ads_conversion_label: analytics.google_ads_conversion_label || null, meta_pixel_id: analytics.meta_pixel_id || null,
      tracking_enabled: analytics.tracking_enabled, updated_at: new Date().toISOString(),
    }
    const savedAnalytics = current.data
      ? await db.from('analytics_settings').update(analyticsPayload).eq('id', current.data.id)
      : await db.from('analytics_settings').insert(analyticsPayload)
    if (savedAnalytics.error) throw savedAnalytics.error
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save site settings.' }, { status: 503 })
  }
}
