import type { Metadata } from 'next'
import { cache } from 'react'
import { siteConfig } from '@/lib/config/site'
import { createPublicClient } from '@/lib/supabase/public'
import { isPublishableMessage } from '@/lib/config/contact'

export type PublicSeoSettings = {
  default_title: string
  title_template: string
  default_description: string
  keywords: string[] | null
  default_og_image: string | null
  canonical_domain: string | null
  homepage_title: string | null
  homepage_description: string | null
  robots_txt_custom: string | null
}

/**
 * Wrapped in React's cache() so the same request (e.g. a page's own
 * generateMetadata() plus the root layout's generateLocalBusinessSchema())
 * shares one Supabase round trip instead of issuing duplicate queries.
 */
export const getPublicSeoSettings = cache(async (): Promise<PublicSeoSettings | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('seo_settings').select('default_title,title_template,default_description,keywords,default_og_image,canonical_domain,homepage_title,homepage_description,robots_txt_custom').limit(1).maybeSingle()
  if (error) throw new Error(`Unable to load public SEO settings: ${error.message}`)
  return data as PublicSeoSettings | null
})

interface GenerateMetadataOptions {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}

export async function generateMetadata(options: GenerateMetadataOptions = {}): Promise<Metadata> {
  const [settings, company] = await Promise.all([getPublicSeoSettings(), getPublicCompanySettings()])
  const {
    title,
    description = settings?.default_description || siteConfig.seo.defaultDescription,
    path = '',
    image = settings?.default_og_image || '/assets/logo.png',
    noIndex = false,
  } = options

  const fullTitle = title
    ? (settings?.title_template || siteConfig.seo.titleTemplate).replace('%s', title)
    : settings?.default_title || siteConfig.seo.defaultTitle

  const baseUrl = settings?.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'
  const url = `${baseUrl}${path}`

  return {
    title: fullTitle,
    description,
    keywords: settings?.keywords || siteConfig.seo.keywords,
    authors: [{ name: company.name || siteConfig.company.name }],
    creator: company.name || siteConfig.company.name,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: company.name || siteConfig.company.name,
      type: 'website',
      locale: 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    alternates: { canonical: url },
    metadataBase: new URL(baseUrl),
  }
}

export const getPublicCompanySettings = cache(async (): Promise<Partial<typeof siteConfig.company>> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return {}
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'company_info').maybeSingle()
  if (error) throw new Error(`Unable to load public company settings: ${error.message}`)
  return (data?.setting_value ?? {}) as Partial<typeof siteConfig.company>
})

/**
 * Organization data for search engines. Only facts the business has entered in
 * Settings are published: phone, email, street address and hours are left out
 * until then, so placeholder values never reach Google.
 */
export async function generateLocalBusinessSchema() {
  const [company, seo, operatingHours] = await Promise.all([getPublicCompanySettings(), getPublicSeoSettings(), getPublicOperatingHours()])
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'
  const isReal = (v?: string) => !!v && !/placeholder|555-01|123 main/i.test(v)
  const weekdayHours = parseHours(operatingHours.weekday)
  const weekendHours = parseHours(operatingHours.weekend)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name || siteConfig.company.name,
    description: seo?.default_description || siteConfig.seo.defaultDescription,
    url: baseUrl,
    logo: `${baseUrl}/assets/logo.png`,
    areaServed: [
      { '@type': 'City', name: 'Denver', address: { '@type': 'PostalAddress', addressRegion: 'CO', addressCountry: 'US' } },
      { '@type': 'City', name: 'Boulder', address: { '@type': 'PostalAddress', addressRegion: 'CO', addressCountry: 'US' } },
    ],
    ...(isReal(company.phone) ? { telephone: company.phone } : {}),
    ...(isReal(company.email) ? { email: company.email } : {}),
    ...(isReal(company.address)
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: company.address,
            addressLocality: company.city || siteConfig.company.city,
            addressRegion: company.state || siteConfig.company.state,
            postalCode: company.zip,
            addressCountry: 'US',
          },
        }
      : {}),
    ...(weekdayHours || weekendHours
      ? {
          openingHoursSpecification: [
            ...(weekdayHours ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: weekdayHours.opens, closes: weekdayHours.closes }] : []),
            ...(weekendHours ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: weekendHours.opens, closes: weekendHours.closes }] : []),
          ],
        }
      : {}),
  }
}

const getPublicOperatingHours = cache(async (): Promise<{ weekday?: string; weekend?: string }> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return {}
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'operating_hours').maybeSingle()
  if (error) throw new Error(`Unable to load public operating hours: ${error.message}`)
  return (data?.setting_value ?? {}) as { weekday?: string; weekend?: string }
})

export type PublicSiteSettingsBundle = {
  company: typeof siteConfig.company
  announcementMessages: string[]
  emergencyAvailable: boolean
  analytics: { gaMeasurementId?: string | null; metaPixelId?: string | null; enabled: boolean }
}

/**
 * Server-side equivalent of what SiteSettingsProvider used to fetch client-side
 * from /api/public/site-settings. Fetched once per request (cached) in the root
 * layout and passed down as the provider's initial state, removing that
 * client-side round trip and the fallback-value flash it caused.
 *
 * Mirrors src/app/api/public/site-settings/route.ts's merge logic exactly so
 * behavior is unchanged — only where the fetch happens has moved.
 */
export const getPublicSiteSettingsBundle = cache(async (): Promise<PublicSiteSettingsBundle> => {
  const fallback: PublicSiteSettingsBundle = {
    company: siteConfig.company,
    announcementMessages: siteConfig.announcement.messages,
    emergencyAvailable: true,
    analytics: { enabled: true },
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return fallback
  try {
    const supabase = createPublicClient()
    const [siteResult, analyticsResult] = await Promise.all([
      supabase.from('site_settings').select('setting_key,setting_value').in('setting_key', ['company_info', 'emergency_banner', 'operating_hours']),
      supabase.from('analytics_settings').select('ga_measurement_id,meta_pixel_id,tracking_enabled').limit(1).maybeSingle(),
    ])
    if (siteResult.error) throw siteResult.error
    if (analyticsResult.error) throw analyticsResult.error
    const settings = Object.fromEntries((siteResult.data ?? []).map((row) => [row.setting_key, row.setting_value])) as Record<string, Record<string, unknown>>
    const company = settings.company_info ?? {}
    const banner = settings.emergency_banner ?? {}
    const hours = settings.operating_hours ?? {}
    const analytics = (analyticsResult.data ?? {}) as { ga_measurement_id?: string | null; meta_pixel_id?: string | null; tracking_enabled?: boolean }
    const bannerMessages = Array.isArray(banner.messages) && banner.messages.length
      ? (banner.messages as string[])
      : typeof banner.text === 'string' ? [banner.text] : []
    return {
      company: { ...siteConfig.company, ...company },
      announcementMessages: banner.enabled ? bannerMessages.filter(isPublishableMessage) : [],
      emergencyAvailable: hours.emergency_available !== false,
      analytics: {
        gaMeasurementId: analytics.ga_measurement_id as string | null | undefined,
        metaPixelId: analytics.meta_pixel_id as string | null | undefined,
        enabled: analytics.tracking_enabled !== false,
      },
    }
  } catch {
    return fallback
  }
})

function parseHours(value?: string) {
  const match = value?.match(/^(\d{1,2}(?::\d{2})?\s*[ap]m)\s*(?:-|–|to)\s*(\d{1,2}(?::\d{2})?\s*[ap]m)$/i)
  if (!match) return null
  const format = (time: string) => {
    const parts = time.replace(/\s/g, '').toUpperCase().match(/^(\d{1,2})(?::(\d{2}))?(AM|PM)$/)
    if (!parts) return ''
    const hour = Number(parts[1]) % 12 + (parts[3] === 'PM' ? 12 : 0)
    return `${String(hour).padStart(2, '0')}:${parts[2] || '00'}`
  }
  const opens = format(match[1])
  const closes = format(match[2])
  return opens && closes ? { opens, closes } : null
}
