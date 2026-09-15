import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config/site'

interface GenerateMetadataOptions {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}

export function generateMetadata(options: GenerateMetadataOptions = {}): Metadata {
  const {
    title,
    description = siteConfig.seo.defaultDescription,
    path = '',
    image = '/assets/logo.png',
    noIndex = false,
  } = options

  const fullTitle = title
    ? siteConfig.seo.titleTemplate.replace('%s', title)
    : siteConfig.seo.defaultTitle

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'
  const url = `${baseUrl}${path}`

  return {
    title: fullTitle,
    description,
    keywords: siteConfig.seo.keywords,
    authors: [{ name: siteConfig.company.name }],
    creator: siteConfig.company.name,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.company.name,
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

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: siteConfig.company.name,
    description: siteConfig.seo.defaultDescription,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com',
    telephone: siteConfig.company.phone,
    email: siteConfig.company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.company.address,
      addressLocality: siteConfig.company.city,
      addressRegion: siteConfig.company.state,
      postalCode: siteConfig.company.zip,
      addressCountry: 'US',
    },
    areaServed: siteConfig.defaultServiceAreas.map((area) => ({
      '@type': 'City',
      name: area.name,
      containedInPlace: { '@type': 'State', name: 'Colorado' },
    })),
    openingHoursSpecification: [
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
