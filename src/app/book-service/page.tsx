import type { Metadata } from 'next'
import { GuidedBookingFunnel } from '@/components/booking/GuidedBookingFunnel'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import { ShieldCheck, Phone } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

export const metadata: Metadata = genMeta({
  title: 'Book a Service Appointment — Denver Plumbing & HVAC | PipeFlow Co.',
  description:
    'Schedule a licensed PipeFlow technician for plumbing, furnace, or AC repair across Denver and the Colorado Front Range. Transparent upfront pricing.',
  path: '/book-service',
})

interface BookServicePageProps {
  searchParams: Promise<{
    service?: string
    category?: string
    area?: string
  }>
}

export default async function BookServicePage({ searchParams }: BookServicePageProps) {
  const { service, category, area } = await searchParams

  return (
    <div className="bg-neutral-50 min-h-screen section-padding">
      <div className="container-site">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-brand-blue uppercase tracking-wider mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>On-Time Arrival Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-navy-900 tracking-tight mb-3">
            Schedule a Service Visit
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Follow the quick steps below to request a convenient diagnostic window. For immediate
            after-hours emergencies, call our Denver dispatch line directly at{' '}
            <a href={`tel:${siteConfig.company.phone}`} className="font-bold text-brand-blue hover:underline">
              {siteConfig.company.phone}
            </a>
            .
          </p>
        </div>

        <GuidedBookingFunnel
          initialService={service}
          initialCategory={category}
          initialArea={area}
        />
      </div>
    </div>
  )
}
