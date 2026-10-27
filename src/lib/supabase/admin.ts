import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import 'server-only'
import { getSupabaseServiceEnv } from './env'

/**
 * Server-only Supabase admin client utilizing the SERVICE_ROLE key.
 * Bypasses Row Level Security for administrative tasks, automated migrations,
 * and background dispatch operations.
 *
 * NEVER import or execute this file in client-side code!
 */
export function createAdminClient() {
  const config = getSupabaseServiceEnv()

  if (!config) {
    throw new Error('Supabase admin access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }

  return createSupabaseClient(
    config.url,
    config.serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
