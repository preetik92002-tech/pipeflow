import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck,
  Award,
  HeartHandshake,
  Compass,
  Droplets,
  Wind,
  CheckCircle2,
  Calendar,
  Phone,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'
import { PageHero } from '@/components/sections/PageHero'

export const metadata: Metadata = genMeta({
  title: 'About PipeFlow Co. — Denver Plumbing & HVAC Specialists',
  description:
    'Learn about PipeFlow Co., our dedication to Colorado craftsmanship, upfront honest pricing, and uniting residential plumbing and HVAC under one trusted brand.',
  path: '/about',
})

const values = [
  {
    icon: Compass,
    title: 'Integrity Above All',
    desc: 'We tell you what is actually broken, provide honest repair options, and never push unnecessary system replacements.',
  },
  {
    icon: ShieldCheck,
    title: 'Code-Compliant Craftsmanship',
    desc: 'Every joint, fitting, vent pipe, and electrical terminal is tested to meet or exceed Colorado municipal building regulations.',
  },
  {
    icon: HeartHandshake,
    title: 'Clean Home Standard',
    desc: 'Clean shoe covers on every visit, protective floor runners, and leaving your utility space cleaner than we found it.',
  },
  {
    icon: Award,
    title: 'Continuous Technical Training',
    desc: 'Our technicians undergo continuous education on cold-climate heat pumps, high-efficiency boilers, and modern acoustic diagnostics.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Cinematic Hero */}
      <PageHero
        imageSrc="/assets/hero-about.jpg"
        imageAlt="PipeFlow master blueprints, precision mechanical tools, and Colorado mountain backdrop"
        eyebrow="Our Story &amp; Standards"
        eyebrowIcon={Compass}
        title="Built for Colorado homes."
        description="Founded in Denver to raise the standard of home service engineering. We unite master plumbing diagnostics and cold-climate HVAC systems under a single, dependable standard of excellence."
        primaryCta={{
          label: 'Book a Service',
          href: '/book-service',
          variant: 'red',
          icon: Calendar,
        }}
        secondaryCta={{
          label: 'Explore Our Services',
          href: '/services',
          variant: 'outline',
          icon: Sparkles,
        }}
        badgeText="100% Colorado Licensed &amp; Insured Mechanics"
      />

      {/* Story & Philosophy */}
      <section className="section-padding container-site">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
              <span>The PipeFlow Standard</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy-900 leading-tight">
              Why We Built PipeFlow Co. For The Front Range
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Colorado homes operate in one of the most demanding climatic environments in the nation.
              From 60-degree temperature swings in autumn to weeks of sustained sub-zero winter freeze,
              residential mechanical infrastructure must be engineered with uncompromising precision.
            </p>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              We founded PipeFlow to replace opaque pricing, subcontractors, and generic repairs with
              rigorous diagnostic testing, transparent quotes, and master technicians who take genuine pride in their craft.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <p className="text-2xl font-bold font-display text-navy-900">100%</p>
                <p className="text-2xs font-semibold text-neutral-500 uppercase mt-0.5">Licensed &amp; Insured</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <p className="text-2xl font-bold font-display text-navy-900">24/7</p>
                <p className="text-2xs font-semibold text-neutral-500 uppercase mt-0.5">Emergency Dispatch</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
              <Image
                src="/assets/hero-hvac.jpg"
                alt="PipeFlow technician inspecting HVAC rooftop mechanical unit against Colorado skyline"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-blue-lighter">Field Leadership</p>
                <p className="text-sm font-bold mt-1">Dedicated technicians equipped with modern diagnostic tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="bg-neutral-50 section-padding border-y border-neutral-200">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold font-display text-navy-900">
              Core Principles Guiding Every Visit
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              How we approach your home, your mechanical systems, and your safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold font-display text-navy-900">{v.title}</h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Ready to Experience The PipeFlow Difference?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
              Schedule your diagnostic appointment or request a detailed estimate from Denver master technicians.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/book-service" className="btn-primary !py-3.5 !px-6 text-xs bg-brand-red hover:bg-brand-red-dark">
              <Calendar className="h-4 w-4" />
              <span>Book Appointment</span>
            </Link>
            <Link href="/get-a-quote" className="btn-outline !py-3.5 !px-6 text-xs text-white border-white/30">
              <FileText className="h-4 w-4" />
              <span>Get Free Estimate</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
