import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  Phone,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Wrench,
  Droplets,
  Wind,
  ArrowRight,
  MapPin,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { Accordion } from '@/components/ui/Accordion'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import type { Service } from '@/types'

interface ServiceDetailPageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

export async function generateStaticParams() {
  return siteConfig.defaultServices.map((service) => ({
    category: service.category,
    slug: service.slug,
  }))
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { category, slug } = await params
  const service = siteConfig.defaultServices.find(
    (s) => s.slug === slug && s.category === category
  )

  if (!service) {
    return { title: 'Service Not Found | PipeFlow Co.' }
  }

  return genMeta({
    title: `${service.title} in Denver, CO | PipeFlow Co.`,
    description: `${service.shortDescription} Licensed Colorado technicians, upfront fixed pricing, and 24/7 emergency dispatch.`,
    path: `/services/${category}/${slug}`,
  })
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { category, slug } = await params
  const service = siteConfig.defaultServices.find(
    (s) => s.slug === slug && s.category === category
  )

  if (!service) {
    notFound()
  }

  const isPlumbing = category === 'plumbing'
  const relatedServices = siteConfig.defaultServices
    .filter((s) => s.category === category && s.slug !== slug)
    .slice(0, 3)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.shortDescription,
    provider: {
      '@type': 'Plumber',
      name: siteConfig.company.name,
      telephone: siteConfig.company.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Denver',
        addressRegion: 'CO',
        postalCode: '80202',
        addressCountry: 'US',
      },
    },
    areaServed: siteConfig.defaultServiceAreas.map((a) => a.name),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.title} Services`,
    },
  }

  // Common issues mapped to service
  const commonIssues = [
    'Unusual rumbling, gurgling, or hissing sounds',
    'Sudden loss of pressure or temperature regulation',
    'Visible moisture, stains, or weeping joints',
    'Unexpected spike in monthly water or gas utility bills',
    'Equipment older than 10 years showing repeated faults',
  ]

  const serviceScope = [
    'Comprehensive multi-point diagnostic inspection',
    'Written, fixed upfront price estimate before work starts',
    'Clean shoe covers, protective drop cloths, and full cleanup',
    'Colorado building and mechanical code compliance testing',
    'Workmanship and parts warranty verification',
  ]

  const serviceFaqs = [
    {
      id: 'faq-1',
      question: `How much does ${service.title} cost?`,
      answer:
        'We diagnose the exact problem in person and provide a fixed upfront quote with no hidden trip fees or surprise hourly billing.',
    },
    {
      id: 'faq-2',
      question: `Can I schedule ${service.title} on the same day?`,
      answer:
        'Yes! For urgent leaks, freezing lines, or heating outages, we maintain emergency dispatch across the Denver metro area.',
    },
    {
      id: 'faq-3',
      question: 'Are your technicians licensed in Colorado?',
      answer:
        'All PipeFlow technicians are vetted, insured, and licensed according to Colorado state mechanical and plumbing board standards.',
    },
  ]

  return (
    <div className="bg-white min-h-screen">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-neutral-50 border-b border-neutral-200/80 py-3.5">
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="text-xs text-neutral-500">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href="/" className="hover:text-navy-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-neutral-400" />
              </li>
              <li>
                <Link href="/services" className="hover:text-navy-900 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-neutral-400" />
              </li>
              <li>
                <Link
                  href={`/services/${category}`}
                  className="hover:text-navy-900 capitalize transition-colors"
                >
                  {category}
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-neutral-400" />
              </li>
              <li>
                <span className="text-navy-900 font-semibold">{service.title}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-navy-900 text-white section-padding relative overflow-hidden">
        <div className="container-site relative z-10 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isPlumbing
                  ? 'bg-blue-500/20 text-brand-blue-lighter border border-blue-400/30'
                  : 'bg-orange-500/20 text-orange-400 border border-orange-400/30'
              }`}
            >
              {isPlumbing ? <Droplets className="h-3.5 w-3.5" /> : <Wind className="h-3.5 w-3.5" />}
              <span>{category.toUpperCase()} SOLUTION</span>
            </span>

            {service.emergency && (
              <span className="rounded-full bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                24/7 Emergency Dispatch
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
            {service.title} in Denver, CO
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-8 max-w-2xl">
            {service.description || service.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/book-service?service=${service.slug}&category=${category}`}
              className="btn-primary !py-3.5 !px-8 text-sm"
            >
              <Calendar className="h-4 w-4" />
              Book This Service
            </Link>
            <Link
              href={`/get-a-quote?service=${service.slug}&category=${category}`}
              className="btn-outline !text-white !border-white/30 text-sm !py-3.5 !px-6"
            >
              <FileText className="h-4 w-4" />
              Get a Quote
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

      {/* Main Breakdown */}
      <div className="section-padding">
        <div className="container-site max-w-4xl mx-auto space-y-16">
          {/* Section: Common Problems We Solve */}
          <div>
            <h2 className="text-2xl font-bold font-display text-navy-900 mb-2">
              Common Symptoms &amp; Issues We Resolve
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              If you notice any of the following warnings in your home, our technicians can diagnose
              and resolve the root cause quickly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {commonIssues.map((issue) => (
                <div
                  key={issue}
                  className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-neutral-700 font-medium leading-snug">
                    {issue}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: What Service Includes */}
          <div className="rounded-3xl bg-neutral-50 border border-neutral-200/80 p-8 sm:p-10">
            <h2 className="text-2xl font-bold font-display text-navy-900 mb-2">
              What&apos;s Included With Every Visit
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              We hold our work to the PipeFlow Quality Standard with transparent pricing and complete respect for your living space:
            </p>
            <div className="space-y-3">
              {serviceScope.map((scope) => (
                <div key={scope} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">{scope}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: 4-Step Process */}
          <div>
            <h2 className="text-2xl font-bold font-display text-navy-900 mb-6">
              Our 4-Step Service Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Schedule Visit', desc: 'Book online or call 24/7 for confirmed arrival windows.' },
                { step: '2', title: 'In-Depth Diagnostic', desc: 'We pinpoint the mechanical issue with precision instruments.' },
                { step: '3', title: 'Upfront Approval', desc: 'You receive options and exact pricing before work begins.' },
                { step: '4', title: 'Guaranteed Repair', desc: 'Completed to Colorado code and verified with performance testing.' },
              ].map((st) => (
                <div key={st.step} className="p-5 rounded-2xl border border-neutral-200 bg-white">
                  <span className="w-7 h-7 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center mb-3">
                    {st.step}
                  </span>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">{st.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-2xl font-bold font-display text-navy-900 mb-4">
              Frequently Asked Questions
            </h2>
            <Accordion items={serviceFaqs} />
          </div>

          {/* Service Area Availability */}
          <div className="p-6 rounded-2xl border border-neutral-200 bg-blue-50/50">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-brand-blue" />
              Service Availability in Colorado
            </h3>
            <p className="text-xs text-neutral-600 mb-4">
              We provide {service.title} throughout Denver and surrounding Front Range communities:
            </p>
            <div className="flex flex-wrap gap-2">
              {siteConfig.defaultServiceAreas.map((area) => (
                <Link
                  key={area.id}
                  href={`/service-areas/${area.slug}`}
                  className="rounded-lg bg-white border border-neutral-200 px-2.5 py-1 text-2xs font-semibold text-neutral-700 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  {area.name}, CO
                </Link>
              ))}
            </div>
          </div>

          {/* Closing CTA */}
          <div className="rounded-3xl bg-navy-900 text-white p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold font-display text-white">
                Ready to Schedule {service.title}?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-md">
                Lock in your appointment window with an expert Colorado technician today.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <Link
                href={`/book-service?service=${service.slug}&category=${category}`}
                className="btn-primary !py-3 !px-6 text-xs"
              >
                Book This Service
              </Link>
              <a href={`tel:${siteConfig.company.phone}`} className="btn-outline !text-white !border-white/30 text-xs !py-3 !px-5">
                Call {siteConfig.company.phone}
              </a>
            </div>
          </div>

          {/* Related Services */}
          {relatedServices.length > 0 && (
            <div className="pt-8 border-t border-neutral-200">
              <h2 className="text-xl font-bold text-navy-900 mb-6">
                Related {category.toUpperCase()} Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedServices.map((rSvc) => (
                  <div
                    key={rSvc.id}
                    className="p-5 rounded-2xl border border-neutral-200 bg-white hover:border-brand-blue/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-navy-900 text-sm mb-1">{rSvc.title}</h3>
                      <p className="text-2xs text-neutral-600 line-clamp-2 mb-4">{rSvc.shortDescription}</p>
                    </div>
                    <Link
                      href={`/services/${category}/${rSvc.slug}`}
                      className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1 mt-auto"
                    >
                      <span>View Service</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
