import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import 'server-only'
import { getSupabasePublicEnv } from './env'

/**
 * Anonymous, cookie-free Supabase client for public (RLS-scoped, non-user-specific)
 * reads used during page rendering and metadata generation.
 *
 * Unlike src/lib/supabase/server.ts, this never calls next/headers' cookies(),
 * so using it does not force Next.js to opt a page out of static rendering/ISR.
 * It must only be used for genuinely public content (no auth.uid()-scoped RLS,
 * no session dependency) — admin and session-aware reads must keep using the
 * cookie-based server client.
 */
export function createPublicClient() {
  const config = getSupabasePublicEnv()
  if (!config) {
    throw new Error('Supabase public client is unavailable: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
  return createSupabaseClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
