import type { Metadata } from 'next'
import { QuoteRequestForm } from '@/components/quote/QuoteRequestForm'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import { FileText, Phone } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { PageHero } from '@/components/sections/PageHero'
import { getServices, toSiteService } from '@/lib/cms/queries'

export const metadata: Metadata = genMeta({
  title: 'Request a Free Quote — Denver Plumbing & HVAC | PipeFlow Co.',
  description:
    'Get a transparent, upfront quote for plumbing repairs, furnace replacement, heat pump upgrades, or AC installation in the Denver metro area.',
  path: '/get-a-quote',
})

interface GetAQuotePageProps {
  searchParams: Promise<{
    service?: string
    category?: string
    area?: string
  }>
}

export default async function GetAQuotePage({ searchParams }: GetAQuotePageProps) {
  const { service, category, area } = await searchParams
  const services = (await getServices()).map(toSiteService)

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Cinematic Image Hero */}
      <PageHero
        imageSrc="/assets/hero-services.jpg"
        imageAlt="PipeFlow master mechanical systems and upfront transparent quotes"
        eyebrow="Upfront Honest Pricing"
        eyebrowIcon={FileText}
        title="Request a transparent, no-obligation quote."
        description="Tell us about your home plumbing or HVAC project. We review every specification thoroughly to provide clear, upfront repair and replacement options."
        primaryCta={{
          label: `Speak With An Estimator: ${siteConfig.company.phone}`,
          href: `tel:${siteConfig.company.phone}`,
          variant: 'red',
          icon: Phone,
          isExternal: true,
        }}
        badgeText="100% Guaranteed Pricing Before Any Work Begins"
      />

      {/* Quote Form Section */}
      <div className="section-padding">
        <div className="container-site">
          <QuoteRequestForm
            initialService={service}
            initialCategory={category}
            initialArea={area}
            services={services}
          />
        </div>
      </div>
    </div>
  )
}
