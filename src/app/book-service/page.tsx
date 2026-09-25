import type { Metadata } from 'next'
import { GuidedBookingFunnel } from '@/components/booking/GuidedBookingFunnel'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import { ShieldCheck, Phone, Calendar } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { PageHero } from '@/components/sections/PageHero'
import { getServices, toSiteService } from '@/lib/cms/queries'

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
  const services = (await getServices()).map(toSiteService)

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Cinematic Image Hero */}
      <PageHero
        imageSrc="/assets/hero-service-areas.jpg"
        imageAlt="PipeFlow service technician and van arriving at Colorado residence"
        eyebrow="On-Time Arrival Guarantee"
        eyebrowIcon={ShieldCheck}
        title="Schedule a service visit with PipeFlow master mechanics."
        description="Select your service requirements, choose a preferred arrival window, and receive instant confirmation from our Denver dispatch desk."
        primaryCta={{
          label: `Emergency Dispatch: ${siteConfig.company.phone}`,
          href: `tel:${siteConfig.company.phone}`,
          variant: 'red',
          icon: Phone,
          isExternal: true,
        }}
        badgeText="2-Hour Arrival Windows • Direct GPS Technician Tracking"
      />

      {/* Booking Wizard Section */}
      <div className="section-padding">
        <div className="container-site">
          <GuidedBookingFunnel
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
