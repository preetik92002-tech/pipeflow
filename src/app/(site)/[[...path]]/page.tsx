import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { SectionRenderer } from '@/components/cms/SectionRenderer'
import { faqJsonLd, serializeJsonLd } from '@/lib/cms-pages/jsonld'
import { ancestorPaths, breadcrumbJsonLd, buildPageContext, serviceJsonLd } from '@/lib/cms-pages/page-context'
import { validatePath, pathToUrl } from '@/lib/cms-pages/paths'
import { getPublishedPage, getPublishedTitles, getRedirect } from '@/lib/cms-pages/repository'
import { siteConfig } from '@/lib/config/site'
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
  const baseUrl = seo?.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'
  const url = `${baseUrl}${path === '' ? '' : pathToUrl(path)}`
  // Structured data sirf indexable pages par, aur sirf wahi jo page par dikh raha hai.
  const jsonLd = [
    faqJsonLd(page.sections),
    page.noindex ? null : breadcrumbJsonLd(ctx.crumbs, baseUrl, url),
    !page.noindex && ctx.kind === 'service'
      ? serviceJsonLd({ name: page.title, description: page.seoDescription || page.description, url, providerName: company.name || siteConfig.company.name, baseUrl })
      : null,
  ].filter(Boolean)

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(ld) }} />
      ))}
      <SectionRenderer sections={page.sections} ctx={ctx} />
    </>
  )
}
