import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Wind,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
  Clock,
  CheckCircle2,
  ChevronRight,
  Thermometer,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { Accordion } from '@/components/ui/Accordion'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = genMeta({
  title: 'Denver Heating, Cooling & Heat Pumps — PipeFlow Co.',
  description:
    'Licensed residential HVAC services in Denver, CO. Furnace repair, AC installation, heat pumps, seasonal tune-ups, and whole-home humidity control.',
  path: '/services/hvac',
})

const hvacGroups = [
  {
    title: 'Cooling & Summer Comfort',
    description: 'High-efficiency AC diagnostics, refrigerant leak testing, compressor fixes, and new system sizing.',
    services: [
      {
        slug: 'ac-repair',
        title: 'Central AC Repair & Diagnostics',
        desc: 'Rapid troubleshooting for frozen evaporator coils, failed capacitors, weak airflow, and refrigerant leaks.',
      },
      {
        slug: 'ac-installation',
        title: 'High-Efficiency AC & Ductless Mini-Splits',
        desc: 'Engineered SEER2 cooling equipment tailored to Denver sun exposure and residential duct configurations.',
      },
    ],
  },
  {
    title: 'Heating & Winter Readiness',
    description: 'Protecting your family from freezing Front Range cold snaps with certified furnace and heat pump solutions.',
    services: [
      {
        slug: 'heating-furnace',
        title: 'Furnace Repair & Heating System Replacement',
        desc: 'Emergency igniter repairs, heat exchanger crack testing, draft inducer replacements, and new gas furnaces.',
      },
      {
        slug: 'heat-pumps',
        title: 'Cold-Climate Heat Pumps & Hybrid Dual-Fuel',
        desc: 'Advanced electric heat pump systems that heat efficiently through Rocky Mountain winters and cool in summer.',
      },
    ],
  },
  {
    title: 'Air Quality & Preventive Maintenance',
    description: 'Combating dry high-altitude winter air and extending mechanical equipment operational lifespan.',
    services: [
      {
        slug: 'hvac-maintenance',
        title: 'Multi-Point Seasonal HVAC Tune-Ups',
        desc: 'Comprehensive electrical testing, burner cleaning, airflow calibration, and preventative filter exchanges.',
      },
      {
        slug: 'indoor-air-quality',
        title: 'Whole-Home Humidifiers & Air Purification',
        desc: 'Steam and bypass humidifiers to balance Colorado arid winter air, plus MERV-13 and HEPA air scrubbers.',
      },
    ],
  },
]

const hvacFaqs = [
  {
    id: 'hvac-faq-1',
    question: 'How does high altitude affect HVAC systems in Denver?',
    answer:
      'At 5,280 feet, thinner air reduces furnace oxygen levels and heat transfer across coils. Equipment must be calibrated with correct altitude orifices and calibrated manifold pressures.',
  },
  {
    id: 'hvac-faq-2',
    question: 'Can cold-climate heat pumps handle Colorado winter weather?',
    answer:
      'Yes, modern inverter heat pumps extract heat down to -13°F. For maximum reliability, many homeowners choose a dual-fuel setup with a gas furnace backup.',
  },
  {
    id: 'hvac-faq-3',
    question: 'Why does my home need a whole-home humidifier in Denver?',
    answer:
      'Colorado winter humidity regularly drops below 15%. Whole-home humidifiers prevent dry sinuses, cracked hardwood floors, static shocks, and make the home feel warmer at lower thermostat settings.',
  },
]

export default function HvacCategoryPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
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
                <span className="text-navy-900 font-semibold">Heating &amp; Air Conditioning</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-navy-900 text-white section-padding relative overflow-hidden">
        <div className="container-site relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 border border-orange-400/30 px-3.5 py-1 text-xs font-bold text-orange-400 uppercase tracking-wider mb-4">
                <Wind className="h-3.5 w-3.5" />
                <span>Denver HVAC Division</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
                Complete Colorado Heating &amp; Cooling Care
              </h1>
              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl mb-8">
                Engineered for altitude and Rocky Mountain climate swings. Certified technicians
                providing emergency furnace repairs, quiet cooling systems, and cold-climate heat pumps.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/book-service?category=hvac" className="btn-primary !py-3.5 !px-7 text-sm">
                  <Calendar className="h-4 w-4" />
                  Book HVAC Service
                </Link>
                <Link href="/get-a-quote?category=hvac" className="btn-outline !text-white !border-white/30 text-sm !py-3.5 !px-6">
                  Get a Free Quote
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

            {/* Supplied HVAC Tech Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-navy-800">
                <Image
                  src="/assets/hero-hvac-tech.jpg"
                  alt="PipeFlow certified HVAC technician servicing residential heating equipment in Denver"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Distinct Service Groups */}
      <section className="section-padding bg-neutral-50">
        <div className="container-site space-y-16">
          {hvacGroups.map((group) => (
            <div key={group.title} className="space-y-6">
              <div className="border-b border-neutral-200 pb-3">
                <h2 className="text-2xl font-bold font-display text-navy-900">{group.title}</h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">{group.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.services.map((svc) => (
                  <article
                    key={svc.slug}
                    className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-navy-900 group-hover:text-brand-blue transition-colors mb-2">
                        <Link href={`/services/hvac/${svc.slug}`}>{svc.title}</Link>
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                        {svc.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100 text-xs mt-auto">
                      <Link
                        href={`/services/hvac/${svc.slug}`}
                        className="font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                      >
                        <span>Learn Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/book-service?service=${svc.slug}&category=hvac`}
                        className="btn-outline !py-1.5 !px-3.5 text-2xs"
                      >
                        Book
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Colorado Climate HVAC FAQs */}
      <section className="section-padding bg-white border-t border-neutral-200/80">
        <div className="container-site max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-navy-900 mb-2">
              Denver HVAC &amp; Climate Questions
            </h2>
            <p className="text-sm text-neutral-600">
              Technical answers regarding altitude sizing, dual-fuel heat pumps, and dry winter air.
            </p>
          </div>
          <Accordion items={hvacFaqs} />
        </div>
      </section>
    </div>
  )
}
