import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Calendar,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Droplets,
  Wind,
  AlertTriangle,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

interface LocationPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return siteConfig.defaultServiceAreas.map((area) => ({
    slug: area.slug,
  }))
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params
  const area = siteConfig.defaultServiceAreas.find((a) => a.slug === slug)

  if (!area) {
    return { title: 'Service Area Not Found | PipeFlow Co.' }
  }

  return genMeta({
    title: `Plumber & HVAC Services in ${area.name}, CO | PipeFlow Co.`,
    description: `Licensed plumbing, heating, and air conditioning services in ${area.name}, Colorado. Same-day emergency response, upfront pricing, and certified local technicians.`,
    path: `/service-areas/${area.slug}`,
  })
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params
  const area = siteConfig.defaultServiceAreas.find((a) => a.slug === slug)

  if (!area) {
    notFound()
  }

  const plumbingServices = siteConfig.defaultServices.filter((s) => s.category === 'plumbing')
  const hvacServices = siteConfig.defaultServices.filter((s) => s.category === 'hvac')

  const localSchema = {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: `PipeFlow Co. — ${area.name} Plumbing & HVAC`,
    description: `Licensed residential plumbing and HVAC solutions in ${area.name}, Colorado.`,
    telephone: siteConfig.company.phone,
    areaServed: {
      '@type': 'City',
      name: area.name,
      containedInPlace: {
        '@type': 'State',
        name: 'Colorado',
      },
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: area.name,
      addressRegion: 'CO',
      postalCode: area.zipCodes?.[0] || '80202',
      addressCountry: 'US',
    },
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
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
                <Link href="/service-areas" className="hover:text-navy-900 transition-colors">
                  Service Areas
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-neutral-400" />
              </li>
              <li>
                <span className="text-navy-900 font-semibold">{area.name}, CO</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Location Hero */}
      <section className="bg-navy-900 text-white section-padding relative overflow-hidden">
        <div className="container-site relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
            <MapPin className="h-3.5 w-3.5" />
            <span>Dedicated Colorado Service Route</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
            Plumbing &amp; HVAC Services in {area.name}, CO
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8">
            PipeFlow Co. provides licensed residential plumbing, heating, and cooling services across{' '}
            {area.name} and surrounding neighborhoods. Same-day emergency response, upfront
            transparent pricing, and certified local technicians.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/book-service?area=${area.slug}`}
              className="btn-primary !py-3.5 !px-7 text-sm"
            >
              <Calendar className="h-4 w-4" />
              Book in {area.name}
            </Link>
            <Link
              href={`/get-a-quote?area=${area.slug}`}
              className="btn-outline !text-white !border-white/30 text-sm !py-3.5 !px-6"
            >
              Request Local Quote
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

      {/* ZIP Code Coverage Pill Bar */}
      {area.zipCodes && area.zipCodes.length > 0 && (
        <div className="bg-neutral-50 border-b border-neutral-200 py-4">
          <div className="container-site">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-navy-900">
                Active ZIP Codes Served in {area.name}:
              </span>
              {area.zipCodes.map((zip) => (
                <span
                  key={zip}
                  className="rounded-md bg-white border border-neutral-200 px-2 py-0.5 text-neutral-700 font-mono"
                >
                  {zip}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Breakdown */}
      <div className="section-padding">
        <div className="container-site max-w-4xl mx-auto space-y-16">
          {/* Local Climate & Plumbing Challenges */}
          <div className="rounded-3xl bg-neutral-50 border border-neutral-200/80 p-8 sm:p-10">
            <h2 className="text-2xl font-bold font-display text-navy-900 mb-3">
              Home Mechanical Challenges in {area.name}
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              Properties in {area.name} contend with Colorado expansive bentonite clay soil that
              shifts underground water laterals, dry high-altitude winter air, and rapid Arctic freeze
              drops. PipeFlow specializes in:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Expansive Soil & Sewer Settling', desc: 'Clay movement cracking older cast-iron or clay sewer laterals.' },
                { title: 'Sub-Zero Freeze Mitigation', desc: 'Preventing burst supply lines during sudden Front Range cold snaps.' },
                { title: 'Hard Water Mineral Buildup', desc: 'Protecting water heaters and plumbing fixtures from calcium scaling.' },
                { title: 'High-Elevation Heating Loss', desc: 'Ensuring furnaces and heat pumps maintain full BTUs in thinner air.' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-white border border-neutral-200/80">
                  <h3 className="font-bold text-navy-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Plumbing Services Available */}
          <div>
            <h2 className="text-2xl font-bold font-display text-navy-900 mb-6 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-brand-blue" />
              Plumbing Solutions in {area.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {plumbingServices.map((svc) => (
                <div key={svc.id} className="p-4 rounded-xl border border-neutral-200 bg-white">
                  <h3 className="font-bold text-navy-900 text-sm mb-1">{svc.title}</h3>
                  <p className="text-2xs text-neutral-600 line-clamp-2 mb-3">{svc.shortDescription}</p>
                  <Link
                    href={`/services/plumbing/${svc.slug}`}
                    className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Service</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* HVAC Services Available */}
          <div>
            <h2 className="text-2xl font-bold font-display text-navy-900 mb-6 flex items-center gap-2">
              <Wind className="h-5 w-5 text-orange-500" />
              Heating &amp; Air Conditioning in {area.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {hvacServices.map((svc) => (
                <div key={svc.id} className="p-4 rounded-xl border border-neutral-200 bg-white">
                  <h3 className="font-bold text-navy-900 text-sm mb-1">{svc.title}</h3>
                  <p className="text-2xs text-neutral-600 line-clamp-2 mb-3">{svc.shortDescription}</p>
                  <Link
                    href={`/services/hvac/${svc.slug}`}
                    className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Service</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Local Dispatch CTA */}
          <div className="rounded-3xl bg-navy-900 text-white p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold font-display text-white">
                Need Service Today in {area.name}?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-md">
                Our local dispatch team will schedule an on-time technician to your home promptly.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href={`/book-service?area=${area.slug}`}
                className="btn-primary !py-3 !px-6 text-xs"
              >
                Book An Appointment
              </Link>
              <a href={`tel:${siteConfig.company.phone}`} className="btn-outline !text-white !border-white/30 text-xs !py-3 !px-5">
                Call {siteConfig.company.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
