import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Search, ArrowRight, ShieldCheck, Phone, CheckCircle2, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ServiceAreaChecker } from '@/components/sections/ServiceAreaChecker'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = genMeta({
  title: 'Colorado Service Areas — Denver Metro Plumbing & HVAC | PipeFlow Co.',
  description:
    'PipeFlow Co. provides licensed plumbing and HVAC services across Denver, Aurora, Lakewood, Littleton, Centennial, and surrounding Colorado counties. Find your city.',
  path: '/service-areas',
})

const countyGroups = [
  {
    county: 'Denver County',
    cities: ['Denver', 'Cherry Creek', 'Highlands', 'Capitol Hill', 'Washington Park'],
  },
  {
    county: 'Arapahoe County',
    cities: ['Aurora', 'Centennial', 'Littleton', 'Englewood', 'Greenwood Village'],
  },
  {
    county: 'Jefferson County',
    cities: ['Lakewood', 'Arvada', 'Wheat Ridge', 'Golden', 'Ken Caryl'],
  },
  {
    county: 'Adams County',
    cities: ['Thornton', 'Westminster', 'Brighton', 'Northglenn', 'Commerce City'],
  },
  {
    county: 'Douglas County',
    cities: ['Parker', 'Castle Rock', 'Highlands Ranch', 'Lone Tree'],
  },
]

export default function ServiceAreasDirectoryPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 text-white section-padding relative overflow-hidden">
        <div className="container-site relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
            <MapPin className="h-3.5 w-3.5" />
            <span>Regional Colorado Coverage</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
            Serving Denver &amp; The Colorado Front Range
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8">
            PipeFlow Co. dispatches licensed, background-checked plumbing and HVAC technicians across
            five Front Range counties. Select your community below to view neighborhood coverage,
            ZIP codes, and same-day dispatch availability.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a href={`tel:${siteConfig.company.phone}`} className="btn-primary !py-3.5 !px-7 text-sm">
              <Phone className="h-4 w-4" />
              Call Dispatch: {siteConfig.company.phone}
            </a>
            <Link href="/book-service" className="btn-outline !text-white !border-white/30 text-sm !py-3.5 !px-6">
              Book Online
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive ZIP Checker */}
      <ServiceAreaChecker />

      {/* County Breakdown */}
      <section className="section-padding bg-neutral-50 border-t border-neutral-200">
        <div className="container-site">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-display font-bold text-navy-900 tracking-tight mb-2">
              County &amp; Municipal Service Zones
            </h2>
            <p className="text-sm text-neutral-600">
              Our service fleet is strategically routed across the greater Denver metropolitan footprint:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countyGroups.map((group) => (
              <div
                key={group.county}
                className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs"
              >
                <h3 className="text-lg font-bold text-navy-900 mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-blue" />
                  {group.county}
                </h3>
                <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-4">
                  Front Range Region
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.cities.map((city) => {
                    const matchedArea = siteConfig.defaultServiceAreas.find(
                      (a) => a.name.toLowerCase() === city.toLowerCase()
                    )
                    return matchedArea ? (
                      <Link
                        key={city}
                        href={`/service-areas/${matchedArea.slug}`}
                        className="rounded-lg bg-blue-50 text-brand-blue border border-blue-100 px-2.5 py-1 text-xs font-medium hover:bg-brand-blue hover:text-white transition-colors"
                      >
                        {city}
                      </Link>
                    ) : (
                      <span
                        key={city}
                        className="rounded-lg bg-neutral-100 text-neutral-600 px-2.5 py-1 text-xs font-medium"
                      >
                        {city}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Route Expansion Note */}
          <div className="mt-12 rounded-2xl bg-white border border-neutral-200 p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-sm">
            <h3 className="text-base font-bold text-navy-900 mb-1">
              Don&apos;t See Your Specific Colorado Neighborhood?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mb-4">
              We frequently accommodate extended Front Range addresses in foothills communities and
              surrounding areas. Contact our dispatch desk to check truck availability.
            </p>
            <a
              href={`tel:${siteConfig.company.phone}`}
              className="btn-outline !py-2 !px-5 text-xs inline-flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5 text-brand-red" />
              Call {siteConfig.company.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
