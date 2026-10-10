import 'server-only'
import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_NAVIGATION, navigationSchema, type Navigation } from './navigation-schema'

const KEY = 'navigation'

/** The saved menus, or the defaults when nothing is saved or what is saved is invalid. */
export const getNavigation = cache(async (): Promise<Navigation> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return DEFAULT_NAVIGATION
  try {
    const { data } = await createAdminClient().from('site_settings').select('setting_value').eq('setting_key', KEY).maybeSingle()
    const parsed = navigationSchema.safeParse(data?.setting_value)
    return parsed.success ? parsed.data : DEFAULT_NAVIGATION
  } catch {
    return DEFAULT_NAVIGATION
  }
})

export async function saveNavigation(nav: Navigation): Promise<void> {
  const { error } = await createAdminClient()
    .from('site_settings')
    .upsert({ setting_key: KEY, setting_value: nav, description: 'Header and footer menus', updated_at: new Date().toISOString() }, { onConflict: 'setting_key' })
  if (error) throw new Error('Unable to save navigation.')
}
