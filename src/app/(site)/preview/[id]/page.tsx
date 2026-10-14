import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SectionRenderer } from '@/components/cms/SectionRenderer'
import { idSchema } from '@/lib/cms-pages/api'
import { getActiveReviews } from '@/lib/cms/queries'
import { ancestorPaths, buildPageContext } from '@/lib/cms-pages/page-context'
import { getPageForAdmin, getPublishedTitles } from '@/lib/cms-pages/repository'
import { verifyAdminAuth } from '@/lib/supabase/auth'

// Never cached, never indexed, and only for signed-in admins.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } }

/**
 * Shows the saved DRAFT with the same renderer and layout as the public site,
 * so the client sees exactly what visitors will see after publishing.
 */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await verifyAdminAuth()
  if (!auth.authorized) redirect(`/admin/login?redirectTo=${encodeURIComponent(`/preview/${id}`)}`)
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) notFound()
  const page = await getPageForAdmin(parsed.data)
  if (!page) notFound()
  // Public page jaisa hi context (hero ka type, pinned story, marquee, breadcrumbs): warna preview aur live alag dikhte.
  const ctx = buildPageContext(page.path, page.title, await getPublishedTitles(ancestorPaths(page.path)))
  if (ctx.kind === 'home' || ctx.kind === 'service') {
    const r = await getActiveReviews(6, ctx.kind === 'service' ? { path: page.path, title: page.title } : undefined)
    ctx.reviews = r.items
    ctx.reviewStats = { count: r.count, average: r.average }
  }
  return (
    <>
      <div role="status" className="sticky top-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-navy-900">
        Preview of the saved draft — not visible to visitors{page.status === 'published' ? ' until you publish your changes' : ' until you publish'}.
      </div>
      <SectionRenderer sections={page.sections} ctx={ctx} />
    </>
  )
}
