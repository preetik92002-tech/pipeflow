import { NextResponse } from 'next/server'
import { getSupabasePublicEnv } from '@/lib/supabase/env'

// Rendered per request so the values come from the host's environment and are never written into the build.
export const dynamic = 'force-dynamic'

/**
 * The project URL and anon key for the browser Supabase client (admin sign-in, request photo uploads). Both are
 * public by design: the anon key only grants what Row Level Security allows. The service-role key is never sent.
 */
export async function GET() {
  const config = getSupabasePublicEnv()
  if (!config) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  return NextResponse.json({ url: config.url, anonKey: config.anonKey }, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
