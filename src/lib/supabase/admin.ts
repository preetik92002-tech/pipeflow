import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import 'server-only'

/**
 * Server-only Supabase admin client utilizing the SERVICE_ROLE key.
 * Bypasses Row Level Security for administrative tasks, automated migrations,
 * and background dispatch operations.
 *
 * NEVER import or execute this file in client-side code!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin access is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
