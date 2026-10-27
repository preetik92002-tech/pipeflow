/**
 * Supabase settings for server code (proxy, server components, route handlers), read when the code runs.
 *
 * Next.js replaces every literal `process.env.NEXT_PUBLIC_*` with its value at build time, in every bundle,
 * including the proxy and server functions. That put the anon key into dozens of build files, which Netlify's
 * secret scanning rejects. Looking a name up through a function argument is dynamic, so it cannot be inlined
 * (node_modules/next/dist/docs/01-app/02-guides/environment-variables.md) and the values stay in the host's
 * environment. Keep it that way: even `const env = process.env; env.NEXT_PUBLIC_X` was inlined by the build.
 * The browser gets the public URL and anon key from /api/public/supabase-config instead.
 *
 * Do not import this from client components: in the browser these lookups are always empty.
 */

/** Reads one variable at runtime. `name` must stay a parameter: a literal property access gets inlined. */
function runtimeEnv(name: string): string | undefined {
  return process.env[name]?.trim()
}

export interface SupabasePublicEnv {
  url: string
  anonKey: string
}

/** The project URL and anon (public) key, or null when either is missing or still a placeholder. */
export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = runtimeEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = runtimeEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!url || !anonKey || url.includes('placeholder') || anonKey.includes('placeholder')) return null
  return { url, anonKey }
}

/** The project URL and service-role key for server-only admin access, or null when either is missing. */
export function getSupabaseServiceEnv(): { url: string; serviceRoleKey: string } | null {
  const url = runtimeEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = runtimeEnv('SUPABASE_SERVICE_ROLE_KEY')
  return url && serviceRoleKey ? { url, serviceRoleKey } : null
}
