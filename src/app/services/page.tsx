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
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

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
      {/* Hero Section */}
      <section className="bg-navy-900 text-white section-padding relative overflow-hidden">
        <div
          className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="container-site relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Denver &amp; Front Range Specialists</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-5 leading-tight">
            Plumbing &amp; HVAC Services Built Around Your Home
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8">
            From sudden frozen pipe ruptures in sub-zero winter cold to high-efficiency AC upgrades
            and whole-home heat pumps, PipeFlow Co. brings licensed technical craftsmanship to every call.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/book-service" className="btn-primary !py-3.5 !px-7 text-sm">
              <Calendar className="h-4 w-4" />
              Book An Appointment
            </Link>
            <Link href="/get-a-quote" className="btn-outline !text-white !border-white/30 text-sm !py-3.5 !px-6">
              Request Free Estimate
            </Link>
            <a
              href={`tel:${siteConfig.company.phone}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white px-2 py-3.5"
            >
              <Phone className="h-4 w-4 text-brand-red" />
              Call: {siteConfig.company.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Trust Highlights Strip */}
      <div className="bg-neutral-50 border-b border-neutral-200/80 py-4">
        <div className="container-site flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-neutral-600">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-blue" />
            Same-Day Dispatch Available
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Upfront Pricing Before Work Begins
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand-blue" />
            Licensed Colorado Plumbers &amp; HVAC Techs
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="section-padding">
        <div className="container-site space-y-20">
          {/* Category 1: Plumbing */}
          <section id="plumbing" className="scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-brand-blue px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                  <Droplets className="h-4 w-4" />
                  <span>Licensed Plumbing Division</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-navy-900 tracking-tight">
                  Residential Plumbing Solutions
                </h2>
                <p className="text-sm text-neutral-600 mt-1 max-w-xl">
                  Precision leak detection, drain clearing, water heater replacement, and whole-home repiping.
                </p>
              </div>

              <Link
                href="/services/plumbing"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-light transition-colors whitespace-nowrap"
              >
                <span>View Full Plumbing Category</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plumbingServices.map((service) => (
                <article
                  key={service.id}
                  className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        <Droplets className="h-5 w-5" />
                      </span>
                      {service.emergency && (
                        <span className="text-2xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-brand-red border border-red-200/60">
                          24/7 Dispatch
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 group-hover:text-brand-blue transition-colors mb-2">
                      <Link href={`/services/plumbing/${service.slug}`}>{service.title}</Link>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100 text-xs mt-auto">
                    <Link
                      href={`/services/plumbing/${service.slug}`}
                      className="font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                    >
                      <span>Learn Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/book-service?service=${service.slug}&category=plumbing`}
                      className="btn-outline !py-1.5 !px-3.5 text-2xs"
                    >
                      Book Service
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Category 2: HVAC */}
          <section id="hvac" className="scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
                  <Wind className="h-4 w-4" />
                  <span>Heating &amp; Air Conditioning Division</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-navy-900 tracking-tight">
                  Heating, Ventilation &amp; Cooling
                </h2>
                <p className="text-sm text-neutral-600 mt-1 max-w-xl">
                  Air conditioning repair and installation, emergency furnace fixes, and high-elevation heat pumps.
                </p>
              </div>

              <Link
                href="/services/hvac"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-light transition-colors whitespace-nowrap"
              >
                <span>View Full HVAC Category</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hvacServices.map((service) => (
                <article
                  key={service.id}
                  className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <Wind className="h-5 w-5" />
                      </span>
                      {service.emergency && (
                        <span className="text-2xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-brand-red border border-red-200/60">
                          Emergency Callout
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-navy-900 group-hover:text-brand-blue transition-colors mb-2">
                      <Link href={`/services/hvac/${service.slug}`}>{service.title}</Link>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100 text-xs mt-auto">
                    <Link
                      href={`/services/hvac/${service.slug}`}
                      className="font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                    >
                      <span>Learn Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/book-service?service=${service.slug}&category=hvac`}
                      className="btn-outline !py-1.5 !px-3.5 text-2xs"
                    >
                      Book Service
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Bottom Conversion Strip */}
          <div className="rounded-3xl bg-neutral-900 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue-lighter">
                Unsure Which Service You Need?
              </span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">
                Speak With a Colorado Master Dispatcher
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-lg">
                Describe your symptoms over the phone and we will route the right technician with the right truck equipment.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <a href={`tel:${siteConfig.company.phone}`} className="btn-primary !py-3 !px-6 text-xs">
                Call {siteConfig.company.phone}
              </a>
              <Link href="/get-a-quote" className="btn-outline !text-white !border-white/30 text-xs !py-3 !px-5">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
