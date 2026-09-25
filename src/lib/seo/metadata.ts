import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config/site'
import { createClient } from '@/lib/supabase/server'

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

export async function getPublicSeoSettings(): Promise<PublicSeoSettings | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  const supabase = await createClient()
  const { data, error } = await supabase.from('seo_settings').select('default_title,title_template,default_description,keywords,default_og_image,canonical_domain,homepage_title,homepage_description,robots_txt_custom').limit(1).maybeSingle()
  if (error) throw new Error(`Unable to load public SEO settings: ${error.message}`)
  return data as PublicSeoSettings | null
}

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

export async function getPublicCompanySettings(): Promise<Partial<typeof siteConfig.company>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return {}
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'company_info').maybeSingle()
  if (error) throw new Error(`Unable to load public company settings: ${error.message}`)
  return (data?.setting_value ?? {}) as Partial<typeof siteConfig.company>
}

export async function generateLocalBusinessSchema() {
  const [company, seo, operatingHours] = await Promise.all([getPublicCompanySettings(), getPublicSeoSettings(), getPublicOperatingHours()])
  const weekdayHours = parseHours(operatingHours.weekday)
  const weekendHours = parseHours(operatingHours.weekend)
  return {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: company.name || siteConfig.company.name,
    description: seo?.default_description || siteConfig.seo.defaultDescription,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com',
    telephone: company.phone || siteConfig.company.phone,
    email: company.email || siteConfig.company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address || siteConfig.company.address,
      addressLocality: company.city || siteConfig.company.city,
      addressRegion: company.state || siteConfig.company.state,
      postalCode: company.zip || siteConfig.company.zip,
      addressCountry: 'US',
    },
    openingHoursSpecification: weekdayHours || weekendHours ? [
      ...(weekdayHours ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: weekdayHours.opens, closes: weekdayHours.closes }] : []),
      ...(weekendHours ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: weekendHours.opens, closes: weekendHours.closes }] : []),
    ] : [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '17:00',
      },
    ],
    priceRange: '$$',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'}/assets/logo.png`,
  }
}

async function getPublicOperatingHours(): Promise<{ weekday?: string; weekend?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return {}
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'operating_hours').maybeSingle()
  if (error) throw new Error(`Unable to load public operating hours: ${error.message}`)
  return (data?.setting_value ?? {}) as { weekday?: string; weekend?: string }
}

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
