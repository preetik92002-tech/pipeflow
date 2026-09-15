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
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

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
      {/* Hero */}
      <section className="bg-navy-900 text-white section-padding relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="container-site relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
            <Compass className="h-3.5 w-3.5" />
            <span>The PipeFlow Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
            Built on Craftsmanship. Focused on Colorado Homes.
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8">
            PipeFlow Co. was founded with a straightforward mission: eliminate the stress, guesswork,
            and hidden fees of residential home mechanical services across Denver and the Front Range.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/book-service" className="btn-primary !py-3.5 !px-7 text-sm">
              <Calendar className="h-4 w-4" />
              Schedule With Us
            </Link>
            <Link href="/services" className="btn-outline !text-white !border-white/30 text-sm !py-3.5 !px-6">
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Are & Our Approach */}
      <section className="section-padding bg-neutral-50 border-b border-neutral-200">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] shadow-xl border border-neutral-200">
                <Image
                  src="/assets/service-detail-2.jpg"
                  alt="PipeFlow technician inspecting water fixtures with precision diagnostic instruments in Colorado"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>

            {/* Right Text */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                Who We Are &amp; Our Approach
              </span>
              <h2 className="text-3xl font-display font-bold text-navy-900 tracking-tight">
                Home Mechanical Service Without the Sales Pressure
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Too many home service companies operate like high-pressure sales outfits rather than
                diligent tradespeople. At PipeFlow Co., our technicians are problem solvers, not
                commission-driven salespeople.
              </p>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                When you invite us into your home, we perform an exhaustive mechanical inspection,
                explain the physical cause of the issue in plain English, and provide a fixed upfront
                price quote before turning a single wrench. You decide how you want to proceed—no
                pressure, no surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes PipeFlow Different: Plumbing + HVAC Under One Roof */}
      <section className="section-padding bg-white border-b border-neutral-200">
        <div className="container-site">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              Unified Whole-Home Mechanical Care
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy-900 tracking-tight mt-1 mb-3">
              Why Plumbing + HVAC Under One Brand Matters
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Your home&apos;s water heater, furnace humidifier, gas lines, boiler, and air
              conditioning condensate lines are physically intertwined. Uniting these trades ensures
              seamless mechanical diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center mb-5 shadow-xs">
                  <Droplets className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Licensed Plumbing Fleet</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Specialized in Front Range water conditions: high mineral content, freezing winter
                  exposure, high municipal pressure regulation, and clay-soil sewer shifting.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-200/60 text-xs font-semibold text-brand-blue">
                Drain Cleaning &bull; Water Heaters &bull; Leak Detection &bull; Repiping
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-orange-50/60 border border-orange-100 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center mb-5 shadow-xs">
                  <Wind className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Certified HVAC Division</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Calibrated for 5,280+ feet altitude: ensuring correct furnace combustion, high-COP
                  cold-climate heat pump performance, and balanced whole-home humidity control.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-orange-200/60 text-xs font-semibold text-orange-600">
                Furnaces &bull; Heat Pumps &bull; Central AC &bull; Whole-Home Humidifiers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-neutral-50 border-b border-neutral-200">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-navy-900 tracking-tight mb-2">
              Our Core Guiding Values
            </h2>
            <p className="text-sm text-neutral-600">
              The foundational commitments that guide every truck dispatch and customer interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val) => {
              const Icon = val.icon
              return (
                <div
                  key={val.title}
                  className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-navy-900 mb-1.5">{val.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Closing Conversion Section */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <div className="rounded-3xl bg-navy-900 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Experience the PipeFlow Difference
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 max-w-md leading-relaxed">
                Book an appointment online or speak directly with our Denver dispatch coordinator today.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <Link href="/book-service" className="btn-primary !py-3.5 !px-6 text-xs">
                Schedule Service Visit
              </Link>
              <a href={`tel:${siteConfig.company.phone}`} className="btn-outline !text-white !border-white/30 text-xs !py-3.5 !px-5">
                Call {siteConfig.company.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
