import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Droplets,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { Accordion } from '@/components/ui/Accordion'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = genMeta({
  title: 'Denver Residential Plumbing Services — PipeFlow Co.',
  description:
    'Expert residential plumbing in Denver, CO. Emergency leak repair, drain cleaning, water heater replacement, sewer line camera inspections, and frozen pipe repair.',
  path: '/services/plumbing',
})

const plumbingGroups = [
  {
    title: 'Emergency & Leak Repairs',
    description: 'Rapid diagnostic and pipe containment to prevent structural drywall and foundation water damage.',
    services: [
      {
        slug: 'leak-repair',
        title: 'Leak Repair & Acoustic Detection',
        desc: 'Acoustic and thermal detection for hidden supply lines behind walls and under concrete slabs.',
      },
      {
        slug: 'pipe-repair',
        title: 'Pipe Repair & Whole-Home Repiping',
        desc: 'PEX re-piping, frozen burst pipe repair, and corrosion-resistant line replacements.',
      },
    ],
  },
  {
    title: 'Drain, Sewer & Water Heating',
    description: 'Heavy-duty hydro-jetting, high-recovery water heater installations, and trenchless sewer clearing.',
    services: [
      {
        slug: 'drain-cleaning',
        title: 'Drain Cleaning & Hydro-Jetting',
        desc: 'Commercial-grade snaking and 4,000 PSI hydro-jetting to blast roots, scale, and grease.',
      },
      {
        slug: 'water-heater',
        title: 'Water Heater Repair & Tankless Upgrades',
        desc: 'High-efficiency tankless and conventional gas/electric water heater replacements with same-day dispatch.',
      },
      {
        slug: 'sewer-services',
        title: 'Sewer Line HD Camera & Trenchless Repair',
        desc: 'Full-color video camera pipe tracing and non-invasive trenchless rehabilitation.',
      },
    ],
  },
  {
    title: 'Fixtures & Pressure Regulation',
    description: 'Protecting home water pressure and upgrading kitchen and bathroom water appliances.',
    services: [
      {
        slug: 'faucet-fixture-repair',
        title: 'Faucet, Fixture & Toilet Repair',
        desc: 'Fixing stubborn drip leaks, running valves, garbage disposals, and installing modern designer fixtures.',
      },
    ],
  },
]

const plumbingFaqs = [
  {
    id: 'plumb-faq-1',
    question: 'How quickly can PipeFlow respond to a plumbing emergency in Denver?',
    answer:
      'We prioritize active flooding, burst pipes, and sewer backups with 24/7 emergency dispatch across Denver, Aurora, Lakewood, and surrounding communities.',
  },
  {
    id: 'plumb-faq-2',
    question: 'Do you work with hard water problems in Colorado?',
    answer:
      'Yes, mineral deposits are common across the Front Range. We install scale-reducing filtration, water softeners, and flush water heaters to mitigate calcium buildup.',
  },
  {
    id: 'plumb-faq-3',
    question: 'What happens if an exterior hose bib freezes in winter?',
    answer:
      'Frost-free sillcocks can still burst if a hose is left attached. We replace cracked valve bodies and install insulated interior shutoff valves for seasonal safety.',
  },
]

export default function PlumbingCategoryPage() {
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
                <span className="text-navy-900 font-semibold">Plumbing</span>
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
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
                <Droplets className="h-3.5 w-3.5" />
                <span>Denver Plumbing Division</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
                Residential Plumbing Done Right the First Time
              </h1>
              <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl mb-8">
                Licensed master plumbers providing leak diagnostics, clear drain cleaning, water
                heater replacements, and clean-cut workmanship across the Front Range.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/book-service?category=plumbing" className="btn-primary !py-3.5 !px-7 text-sm">
                  <Calendar className="h-4 w-4" />
                  Book Plumbing Service
                </Link>
                <Link href="/get-a-quote?category=plumbing" className="btn-outline !text-white !border-white/30 text-sm !py-3.5 !px-6">
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

            {/* Supplied Kitchen Plumber Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-navy-800">
                <Image
                  src="/assets/service-plumbing.jpg"
                  alt="PipeFlow licensed plumber installing faucet fixtures in a residential kitchen"
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
          {plumbingGroups.map((group) => (
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
                        <Link href={`/services/plumbing/${svc.slug}`}>{svc.title}</Link>
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                        {svc.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100 text-xs mt-auto">
                      <Link
                        href={`/services/plumbing/${svc.slug}`}
                        className="font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
                      >
                        <span>Learn Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/book-service?service=${svc.slug}&category=plumbing`}
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

      {/* Colorado Plumbing FAQs */}
      <section className="section-padding bg-white border-t border-neutral-200/80">
        <div className="container-site max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-navy-900 mb-2">
              Plumbing Questions &amp; Answers
            </h2>
            <p className="text-sm text-neutral-600">
              Guidance for Front Range homeowners regarding municipal water, freezing lines, and maintenance.
            </p>
          </div>
          <Accordion items={plumbingFaqs} />
        </div>
      </section>
    </div>
  )
}
