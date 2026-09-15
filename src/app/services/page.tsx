import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Droplets,
  Wind,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  Wrench,
  FileText,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import { PageHero } from '@/components/sections/PageHero'

export const metadata: Metadata = genMeta({
  title: 'Plumbing & HVAC Services Built Around Your Home — Denver, CO',
  description:
    'Comprehensive residential plumbing, heating, and cooling services across the Denver metro area. Upfront pricing, licensed technicians, and 24/7 emergency dispatch.',
  path: '/services',
})

export default function ServicesPage() {
  const plumbingServices = siteConfig.defaultServices.filter((s) => s.category === 'plumbing')
  const hvacServices = siteConfig.defaultServices.filter((s) => s.category === 'hvac')

  return (
    <div className="bg-white min-h-screen">
      {/* Cinematic Image Hero */}
      <PageHero
        imageSrc="/assets/hero-services.jpg"
        imageAlt="PipeFlow precision mechanical plumbing and HVAC equipment installation in Colorado home"
        eyebrow="Plumbing &amp; HVAC Services"
        eyebrowIcon={Wrench}
        title="Plumbing & HVAC services built for Colorado homes"
        description="From emergency repairs to preventative maintenance, we're ready when you need us. PipeFlow Co. brings licensed master craftsmanship and upfront pricing to every Front Range call."
        primaryCta={{
          label: 'Book a Service',
          href: '/book-service',
          variant: 'red',
          icon: Calendar,
        }}
        secondaryCta={{
          label: 'Request Free Quote',
          href: '/get-a-quote',
          variant: 'outline',
          icon: FileText,
        }}
        badgeText="24/7 Rapid Emergency Response Available Across Denver Metro"
      />

      {/* Services Navigation Strip */}
      <section className="bg-navy-900 border-b border-navy-800 py-4 sticky top-16 z-20 shadow-md">
        <div className="container-site flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-neutral-400 uppercase tracking-wider text-2xs">Quick Jump:</span>
            <a
              href="#plumbing-section"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-white hover:bg-brand-blue transition-colors"
            >
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              <span>Plumbing Services ({plumbingServices.length})</span>
            </a>
            <a
              href="#hvac-section"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-white hover:bg-brand-blue transition-colors"
            >
              <Wind className="h-3.5 w-3.5 text-amber-400" />
              <span>HVAC &amp; Heating ({hvacServices.length})</span>
            </a>
          </div>

          <a
            href={`tel:${siteConfig.company.phone}`}
            className="text-2xs font-bold text-brand-blue-lighter hover:text-white flex items-center gap-1 shrink-0"
          >
            <span>Need immediate dispatch?</span>
            <span className="underline">{siteConfig.company.phone}</span>
          </a>
        </div>
      </section>

      {/* Main Services Content */}
      <div className="section-padding space-y-20">
        {/* Plumbing Trade Section */}
        <section id="plumbing-section" className="container-site scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-neutral-200 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">
                <Droplets className="h-4 w-4" />
                <span>Trade Division 01</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy-900">
                Residential Plumbing Services
              </h2>
              <p className="text-sm text-neutral-600 mt-2 max-w-2xl">
                Precision drain clearing, tankless water heater retrofits, whole-home repiping, and
                non-invasive acoustic leak diagnostics throughout the Front Range.
              </p>
            </div>
            <Link
              href="/services/plumbing"
              className="text-xs font-bold text-brand-blue hover:text-brand-blue-light flex items-center gap-1 shrink-0"
            >
              <span>Explore All Plumbing Solutions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plumbingServices.map((service) => (
              <div
                key={service.slug}
                className="bg-white rounded-2xl border border-neutral-200/80 p-6 hover:shadow-xl hover:border-brand-blue/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue mb-4 group-hover:scale-105 transition-transform">
                    <Droplets className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-navy-900 group-hover:text-brand-blue transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
                  <Link
                    href={`/services/plumbing/${service.slug}`}
                    className="text-xs font-bold text-brand-blue group-hover:underline flex items-center gap-1"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/book-service"
                    className="text-2xs font-bold bg-navy-900 hover:bg-brand-red text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HVAC Trade Section */}
        <section id="hvac-section" className="container-site scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-neutral-200 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                <Wind className="h-4 w-4" />
                <span>Trade Division 02</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy-900">
                Heating, Heat Pumps &amp; Cooling
              </h2>
              <p className="text-sm text-neutral-600 mt-2 max-w-2xl">
                Engineered for altitude and sub-zero Colorado winter conditions. Certified furnace repairs,
                cold-climate inverter heat pumps, and ductless split diagnostics.
              </p>
            </div>
            <Link
              href="/services/hvac"
              className="text-xs font-bold text-brand-blue hover:text-brand-blue-light flex items-center gap-1 shrink-0"
            >
              <span>Explore All HVAC Solutions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hvacServices.map((service) => (
              <div
                key={service.slug}
                className="bg-white rounded-2xl border border-neutral-200/80 p-6 hover:shadow-xl hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition-transform">
                    <Wind className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-navy-900 group-hover:text-amber-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
                  <Link
                    href={`/services/hvac/${service.slug}`}
                    className="text-xs font-bold text-brand-blue group-hover:underline flex items-center gap-1"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/book-service"
                    className="text-2xs font-bold bg-navy-900 hover:bg-brand-red text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Emergency Assurance Banner */}
      <section className="bg-navy-950 text-white py-14 border-t border-navy-800">
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Experiencing a Plumbing or Heating Emergency?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Burst pipes, sewer backups, and furnace outages in sub-zero Colorado weather receive priority 24/7 dispatch.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={`tel:${siteConfig.company.phone}`} className="btn-primary !py-3 !px-6 text-xs bg-brand-red hover:bg-brand-red-dark">
              <Phone className="h-3.5 w-3.5" />
              <span>Call Dispatch: {siteConfig.company.phone}</span>
            </a>
            <Link href="/book-service" className="btn-outline !py-3 !px-5 text-xs text-white border-white/30">
              Online Dispatch Request
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
