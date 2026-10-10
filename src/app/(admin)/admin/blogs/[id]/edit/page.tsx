import { notFound, redirect } from 'next/navigation'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { toBlogPost } from '@/lib/cms/queries'
import type { CmsBlog } from '@/lib/cms/types'

export const dynamic = 'force-dynamic'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminAuth()
  if (!auth.authenticated) redirect('/admin/login')
  if (!auth.authorized) redirect('/admin/unauthorized')
  const { id } = await params
  const { data, error } = await createAdminClient().from('blogs').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Unable to load article: ${error.message}`)
  if (!data) notFound()
  return <BlogEditor initialPost={toBlogPost(data as CmsBlog)} isNew={false} />
}
