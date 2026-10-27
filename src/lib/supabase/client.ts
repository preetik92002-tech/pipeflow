import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let pending: Promise<SupabaseClient> | null = null

/**
 * The browser Supabase client. Its URL and anon key come from /api/public/supabase-config at runtime instead of
 * being compiled into the JavaScript bundle (see lib/supabase/env.ts). Loaded once per page; a failed load is
 * retried on the next call.
 */
export function createClient(): Promise<SupabaseClient> {
  pending ??= (async () => {
    const res = await fetch('/api/public/supabase-config', { cache: 'no-store' })
    const config = (await res.json().catch(() => null)) as { url?: string; anonKey?: string } | null
    if (!res.ok || !config?.url || !config.anonKey) throw new Error('Supabase browser client is unavailable: the site is missing its Supabase settings.')
    return createBrowserClient(config.url, config.anonKey)
  })().catch((error: unknown) => {
    pending = null
    throw error
  })
  return pending
}
