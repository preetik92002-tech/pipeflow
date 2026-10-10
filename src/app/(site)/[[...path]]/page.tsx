import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { SectionRenderer } from '@/components/cms/SectionRenderer'
import { faqJsonLd, serializeJsonLd } from '@/lib/cms-pages/jsonld'
import { validatePath, pathToUrl } from '@/lib/cms-pages/paths'
import { getFallbackPage } from '@/lib/cms-pages/fallback'
import { getPublishedPage, getRedirect } from '@/lib/cms-pages/repository'
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata'

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
  try {
    return await getPublishedPage(path)
  } catch (error) {
    // Database unreachable or not set up yet: serve the built-in launch pages.
    console.error('CMS page lookup failed, using built-in content', error)
    return getFallbackPage(path)
  }
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
      const redirect = await getRedirect(path).catch(() => null)
      if (redirect) permanentRedirect(pathToUrl(redirect.to))
    }
    notFound()
  }

  const jsonLd = faqJsonLd(page.sections)
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />}
      <SectionRenderer sections={page.sections} />
    </>
  )
}
