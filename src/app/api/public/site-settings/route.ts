import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await createClient()
    const [siteResult, analyticsResult] = await Promise.all([
      db.from('site_settings').select('setting_key,setting_value').in('setting_key', ['company_info', 'emergency_banner', 'operating_hours']),
      db.from('analytics_settings').select('ga_measurement_id,meta_pixel_id,tracking_enabled').limit(1).maybeSingle(),
    ])
    if (siteResult.error) throw siteResult.error
    if (analyticsResult.error) throw analyticsResult.error
    const settings = Object.fromEntries((siteResult.data ?? []).map((row) => [row.setting_key, row.setting_value]))
    const banner = settings.emergency_banner as { messages?: unknown; text?: unknown; enabled?: unknown } | undefined
    if (banner && !Array.isArray(banner.messages) && typeof banner.text === 'string') {
      settings.emergency_banner = { ...banner, messages: [banner.text] }
    }
    return NextResponse.json({ ...settings, analytics: analyticsResult.data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load public settings.' }, { status: 503 })
  }
}
