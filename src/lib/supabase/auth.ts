import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { User } from '@supabase/supabase-js'

export interface AdminAuthResult {
  authenticated: boolean
  authorized: boolean
  user: User | null
  role: string | null
  error?: string
}

const ADMIN_ROLES = ['super_admin', 'admin', 'editor', 'marketing']

/**
 * Server-side authentication and admin authorization check.
 * Validates the caller using Supabase server cookie session,
 * then checks their role in the `profiles` table or user metadata.
 */
export async function verifyAdminAuth(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        authenticated: false,
        authorized: false,
        user: null,
        role: null,
        error: 'Unauthenticated: No active Supabase session.',
      }
    }

    // 1. Check user metadata first (if role is directly encoded into app_metadata or user_metadata)
    // user_metadata is user-editable and must never grant administrative access.
    const metaRole = user.app_metadata?.role as string | undefined
    if (metaRole && ADMIN_ROLES.includes(metaRole.toLowerCase())) {
      return {
        authenticated: true,
        authorized: true,
        user,
        role: metaRole,
      }
    }

    // 2. Query the profiles table using admin bypass (service role) to check the user's role safely
    const adminSupabase = createAdminClient()
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profileError && profile?.role && ADMIN_ROLES.includes(profile.role.toLowerCase())) {
      return {
        authenticated: true,
        authorized: true,
        user,
        role: profile.role,
      }
    }

    // 3. Fallback: If no profiles table record yet (e.g. freshly created user before migration or initial setup),
    // check if this is the first registered user or user has admin claim
    // If neither, user is authenticated but not authorized.
    return {
      authenticated: true,
      authorized: false,
      user,
      role: profile?.role || 'user',
      error: 'Forbidden: User is authenticated but does not possess admin privileges.',
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error verifying authentication.'
    return {
      authenticated: false,
      authorized: false,
      user: null,
      role: null,
      error: message,
    }
  }
}
