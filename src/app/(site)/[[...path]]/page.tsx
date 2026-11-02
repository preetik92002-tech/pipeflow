import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { SectionRenderer } from '@/components/cms/SectionRenderer'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { faqJsonLd, serializeJsonLd } from '@/lib/cms-pages/jsonld'
import { ancestorPaths, breadcrumbJsonLd, buildPageContext, serviceJsonLd } from '@/lib/cms-pages/page-context'
import { validatePath, pathToUrl } from '@/lib/cms-pages/paths'
import { linkedCmsPaths, serviceCrumbs, serviceTemplateOf } from '@/lib/cms-pages/service-links'
import { getPublishedPage, getPublishedTitles, getRedirect, listPublishedPaths } from '@/lib/cms-pages/repository'
import { siteConfig } from '@/lib/config/site'
import { getActiveReviews } from '@/lib/cms/queries'
import { generateMetadata as buildMetadata, getPublicCompanySettings, getPublicSeoSettings } from '@/lib/seo/metadata'

/**
 * Every page the client creates is served here: /our-services, /hvac/ac-repair
 * and the homepage all resolve through this one route, so a new page needs no
 * new code. Static routes (/admin, /api, /blog, ...) win over this catch-all.
 *
 * Pages are cached and rebuilt the moment an admin publishes, unpublishes,
 * moves or deletes one (revalidatePath in the admin API). The hourly refresh
 * is only a safety net.
 */
export const revalidate = 3600

type Props = { params: Promise<{ path?: string[] }> }

/**
 * Without this, the catch-all has no build-time shell for any path, so every request — the
 * homepage and every CMS page alike — renders fully dynamic (HTTP Cache-Control: private,
 * no-store) no matter what `revalidate` says, and the host's CDN/ISR cache never gets a chance
 * to serve it. Listing published paths here gives each one a cached shell; `revalidate` then
 * keeps it fresh exactly as the comment above already describes. `dynamicParams` stays at its
 * default `true`, so a page published after the last build still renders on demand and is
 * cached from then on. If this read fails (e.g. Supabase unreachable at build time), returning
 * an empty list falls back to today's fully-dynamic behavior for every path — never fails the
 * build over this.
 */
export async function generateStaticParams(): Promise<{ path: string[] }[]> {
  try {
    const pages = await listPublishedPaths()
    return pages.map((p) => ({ path: p.path === '' ? [] : p.path.split('/') }))
  } catch (error) {
    console.error('[cms page] generateStaticParams could not list published pages:', error instanceof Error ? error.message : error)
    return []
  }
}

function toPath(segments: string[] | undefined) {
  try {
    return (segments ?? []).map((s) => decodeURIComponent(s)).join('/')
  } catch {
    return '/malformed' // fails path validation, so it renders the 404
  }
}

const load = cache(async (path: string) => {
  if (validatePath(path, { allowHome: true })) return null
  return getPublishedPage(path)
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = toPath((await params).path)
  const page = await load(path)
  if (!page) return { robots: 'noindex' }
  const meta = await buildMetadata({
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.description || undefined,
    path: path === '' ? '' : pathToUrl(path),
    image: page.ogImage || undefined,
    noIndex: page.noindex,
  })
  if (page.canonicalUrl) meta.alternates = { canonical: page.canonicalUrl }
  return meta
}

export default async function CmsPage({ params }: Props) {
  const path = toPath((await params).path)
  const page = await load(path)

  if (!page) {
    if (!validatePath(path, { allowHome: true }) && path !== '') {
      const redirect = await getRedirect(path)
      if (redirect) permanentRedirect(pathToUrl(redirect.to))
    }
    notFound()
  }

  const [liveTitles, seo, company] = await Promise.all([getPublishedTitles(ancestorPaths(path)), getPublicSeoSettings(), getPublicCompanySettings()])
  const ctx = buildPageContext(path, page.title, liveTitles)
  // Service templates (at any URL) link to other CMS pages: withhold links to pages that are not live yet.
  const template = serviceTemplateOf(page.sections)
  const linked = template ? linkedCmsPaths(page.sections) : []
  if (linked.length) {
    try {
      ctx.liveHrefs = new Set([...(await getPublishedTitles(linked)).keys()].map((p) => `/${p}`))
    } catch (error) {
      // Optional: without the answer the links stay, exactly as before.
      console.error('[cms page] could not check which linked pages are live:', error instanceof Error ? error.message : error)
    }
  }
  if (ctx.kind === 'home' || ctx.kind === 'service') {
    const r = await getActiveReviews(6, ctx.kind === 'service' ? { path: path, title: page.title } : undefined)
    ctx.reviews = r.items
    ctx.reviewStats = { count: r.count, average: r.average }
  }
  const baseUrl = seo?.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'
  const url = `${baseUrl}${path === '' ? '' : pathToUrl(path)}`
  // Structured data sirf indexable pages par, aur sirf wahi jo page par dikh raha hai.
  const jsonLd = [
    faqJsonLd(page.sections),
    // A service template shows its own breadcrumb trail, so the structured data describes that trail.
    page.noindex ? null : breadcrumbJsonLd((template && serviceCrumbs(page.sections, ctx.liveHrefs)) || ctx.crumbs, baseUrl, url),
    // Service data only for real service pages: those under /plumbing, /hvac, /commercial, or any page built from the service-detail template.
    !page.noindex && (ctx.kind === 'service' || template === 'serviceDetail')
      ? serviceJsonLd({ name: page.title, description: page.seoDescription || page.description, url, providerName: company.name || siteConfig.company.name, baseUrl })
      : null,
  ].filter(Boolean)

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(ld) }} />
      ))}
      <SectionRenderer sections={page.sections} ctx={ctx} />
      {ctx.kind === 'home' && (
        <section className="border-t border-white/10 bg-ink py-10 text-white sm:py-12" aria-labelledby="home-customer-reviews-heading">
          <div className="container-wide">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="ui-kicker !text-terra-light">Customer reviews</p>
                <h2 id="home-customer-reviews-heading" className="mt-2 font-display text-display-md font-semibold text-white">
                  What customers say
                </h2>
              </div>
              <Link href="/reviews" className="inline-flex min-h-11 w-fit items-center font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:text-terra-light hover:decoration-terra-light">
                Read All Reviews
              </Link>
            </div>
            {ctx.reviews?.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ctx.reviews.slice(0, 3).map((review, index) => (
                  <ReviewCard key={`${review.name}-${review.date ?? ''}-${index}`} review={review} />
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-xl border border-white/15 bg-white/5 p-5 text-sm text-white/75">
                Customer reviews will appear here once they are published.
              </p>
            )}
          </div>
        </section>
      )}
    </>
  )
}
