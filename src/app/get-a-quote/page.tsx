import type { Metadata } from 'next'
import { QuoteRequestForm } from '@/components/quote/QuoteRequestForm'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

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

  return (
    <div className="bg-neutral-50 min-h-screen section-padding">
      <div className="container-site">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-navy-900 tracking-tight mb-2">
            Request an Upfront Quote
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Tell us about your home mechanical project. We review every request carefully to give
            you honest, clear pricing options.
          </p>
        </div>

        <QuoteRequestForm
          initialService={service}
          initialCategory={category}
          initialArea={area}
        />
      </div>
    </div>
  )
}
