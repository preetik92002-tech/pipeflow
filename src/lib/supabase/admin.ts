import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
    console.warn(
      '[SUPABASE ADMIN] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Admin bypass client running in stub mode.'
    )
  }

  return createSupabaseClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    serviceRoleKey || 'placeholder-service-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
