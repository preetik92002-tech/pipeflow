import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Search, ArrowRight, ShieldCheck, Phone, CheckCircle2, Clock, Calendar, FileText } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ServiceAreaChecker } from '@/components/sections/ServiceAreaChecker'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import { PageHero } from '@/components/sections/PageHero'

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
      {/* Cinematic Hero */}
      <PageHero
        imageSrc="/assets/hero-service-areas.jpg"
        imageAlt="PipeFlow service van and licensed technician arriving at Colorado home with mountain range backdrop"
        eyebrow="Regional Colorado Coverage"
        eyebrowIcon={MapPin}
        title="Serving Colorado homeowners across the Front Range."
        description="Reliable plumbing and HVAC service across the Front Range. Select your community below to verify same-day routes, neighborhood coverage, and dispatch availability."
        primaryCta={{
          label: 'Find a Specialist',
          href: '#service-area-checker',
          variant: 'red',
          icon: Search,
        }}
        secondaryCta={{
          label: 'Call Dispatch Direct',
          href: `tel:${siteConfig.company.phone}`,
          variant: 'outline',
          icon: Phone,
          isExternal: true,
        }}
        badgeText="Rapid Dispatch Across 5 Front Range Counties"
      />

      {/* Interactive Service Area Checker */}
      <div id="service-area-checker" className="scroll-mt-20">
        <ServiceAreaChecker />
      </div>

      {/* County Directory Grid */}
      <section className="section-padding container-site">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">
            <span>Directory Coverage</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-navy-900">
            Front Range Communities We Serve Daily
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Click on any municipality to view localized emergency plumbing protocols, HVAC tune-up routes, and local customer reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countyGroups.map((group) => (
            <div
              key={group.county}
              className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs hover:shadow-lg transition-all"
            >
              <h3 className="text-base font-bold font-display text-navy-900 border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-blue" />
                <span>{group.county}</span>
              </h3>
              <ul className="space-y-2.5">
                {group.cities.map((city) => {
                  const slug = city.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <li key={city}>
                      <Link
                        href={`/service-areas/${slug}`}
                        className="flex items-center justify-between text-xs font-medium text-neutral-700 hover:text-brand-blue group"
                      >
                        <span>{city}</span>
                        <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Assurance Banner */}
      <section className="bg-navy-950 text-white py-14 border-t border-navy-800">
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Not Seeing Your Exact ZIP Code Listed?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              We frequently expand our daily service routes for major mechanical repairs and replacements. Contact dispatch directly to verify technician availability in your neighborhood.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={`tel:${siteConfig.company.phone}`} className="btn-primary !py-3 !px-6 text-xs bg-brand-red hover:bg-brand-red-dark">
              <Phone className="h-3.5 w-3.5" />
              <span>{siteConfig.company.phone}</span>
            </a>
            <Link href="/get-a-quote" className="btn-outline !py-3 !px-5 text-xs text-white border-white/30">
              Request Online
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
