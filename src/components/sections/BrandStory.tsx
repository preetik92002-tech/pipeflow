'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  FileText,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  Droplets,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

export function BrandStory() {
  return (
    <section
      id="brand-story"
      className="section-padding bg-gradient-to-b from-white via-neutral-50 to-white border-b border-neutral-200/80 overflow-hidden relative"
      aria-labelledby="brand-story-heading"
    >
      {/* Subtle Background Accent Pattern */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-blue/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand-red/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-site relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Large PipeFlow Logo & Heritage Card (5 cols) */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="right" distance={30}>
              <div className="rounded-3xl bg-navy-900 border border-navy-800 p-8 sm:p-10 shadow-2xl relative overflow-hidden text-white flex flex-col justify-between">
                {/* Background Tech Image Overlay */}
                <div className="absolute inset-0 opacity-15 overflow-hidden">
                  <Image
                    src="/assets/service-plumbing.jpg"
                    alt="PipeFlow technician craftsmanship"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/90 to-navy-900/80" />

                {/* Content over background */}
                <div className="relative z-10 space-y-6">
                  {/* Large Prominent PipeFlow Logo (240px–340px) */}
                  <div className="pb-6 border-b border-white/15">
                    <Image
                      src="/assets/logo.png"
                      alt="PipeFlow Co. — Denver Plumbing & HVAC"
                      width={340}
                      height={120}
                      className="w-[200px] sm:w-[260px] lg:w-[300px] h-auto object-contain brightness-110"
                      priority
                    />
                    <p className="text-2xs uppercase tracking-widest text-brand-blue-lighter font-mono font-semibold mt-3">
                      Colorado Residential Trade Standards
                    </p>
                  </div>

                  {/* Core Brand Pillars */}
                  <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-brand-blue/30 text-brand-blue-lighter">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span>Licensed &amp; Insured Master Technicians</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-brand-red/30 text-brand-red-light">
                        <Clock className="h-4 w-4" />
                      </div>
                      <span>Same-Day Front Range Emergency Dispatch</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span>Fixed Upfront Quotes &bull; Zero Surprises</span>
                    </div>
                  </div>

                  {/* Denver Front Range Footprint Card */}
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                      <span>Primary Service Territory</span>
                      <span className="text-brand-blue-lighter">Denver Metro</span>
                    </div>
                    <p className="text-xs text-neutral-200">
                      Denver, Aurora, Lakewood, Englewood, Littleton, Arvada, Westminster &amp; surrounding areas.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Editorial Narrative & Dual CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal direction="left" distance={30}>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>The PipeFlow Philosophy</span>
              </div>

              <h2
                id="brand-story-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight leading-[1.12]"
              >
                Built to Keep Colorado Homes Comfortable.
              </h2>

              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed pt-2">
                Colorado homes endure unique climatic extremes — from sub-zero winter cold snaps that threaten exposed pipes and aging boilers to summer heatwaves demanding high-efficiency air conditioning.
              </p>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                PipeFlow Co. was founded on a simple premise: homeowners deserve reliable, transparent mechanical service without the runaround. When our master plumbers and certified HVAC technicians arrive at your door, they bring diagnostic precision, clear options, and long-lasting craftsmanship.
              </p>

              {/* Dual Trade Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-brand-blue flex-shrink-0">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Master Plumbing Care</h4>
                    <p className="text-2xs text-neutral-500 mt-0.5">
                      Leak mitigation, copper/PEX repiping, drain jetting, and water heater replacements.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-red-50 text-brand-red flex-shrink-0">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Climate-Ready HVAC</h4>
                    <p className="text-2xs text-neutral-500 mt-0.5">
                      Furnace diagnostics, heat pumps, central AC tune-ups, and emergency heating repairs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href={siteConfig.ctas.bookService.href}
                  className="btn-primary !py-4 !px-8 !text-base shadow-lg shadow-brand-red/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>{siteConfig.ctas.bookService.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={siteConfig.ctas.getQuote.href}
                  className="btn-outline !py-4 !px-8 !text-base hover:-translate-y-0.5 transition-all text-center"
                >
                  <span>{siteConfig.ctas.getQuote.label}</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  )
}

export default BrandStory
