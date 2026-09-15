'use client'

import Link from 'next/link'
import { Calendar, FileText, Phone, ShieldCheck, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

export function FinalCTA() {
  return (
    <section
      className="relative section-padding bg-navy-950 text-white overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      {/* Background Animated Ambient Gradients */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none animate-pulse-subtle"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-red/15 blur-3xl pointer-events-none animate-pulse-subtle"
        style={{ animationDelay: '1.5s' }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10 text-center max-w-3xl mx-auto">
        <ScrollReveal direction="up" distance={20}>
          {/* Tag */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-5 backdrop-blur-xs">
            <ShieldCheck className="h-4 w-4 text-brand-blue-lighter flex-shrink-0" />
            <span>Proudly Colorado Owned &amp; Operated</span>
          </div>

          {/* Headline */}
          <h2
            id="final-cta-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-5"
          >
            Your Home Should Work Better.
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-10 max-w-2xl mx-auto">
            Don&apos;t wait for a small leak or HVAC glitch to become an expensive emergency. Schedule a
            qualified PipeFlow technician today with fixed upfront quotes and guaranteed workmanship.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href={siteConfig.ctas.bookService.href}
              className="btn-primary w-full sm:w-auto !py-4 !px-8 !text-base !rounded-xl shadow-lg shadow-brand-red/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" aria-hidden="true" />
              <span>{siteConfig.ctas.bookService.label}</span>
              <ArrowRight className="h-4 w-4 opacity-70" />
            </Link>

            <Link
              href={siteConfig.ctas.getQuote.href}
              className="btn-outline w-full sm:w-auto !text-white !border-white/30 hover:!border-white hover:!bg-white/10 !py-4 !px-8 !text-base !rounded-xl backdrop-blur-xs hover:-translate-y-0.5 transition-all"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              <span>{siteConfig.ctas.getQuote.label}</span>
            </Link>

            <a
              href={`tel:${siteConfig.ctas.callNow.phone}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-white hover:text-brand-blue-lighter transition-colors"
              aria-label={`Call PipeFlow directly at ${siteConfig.ctas.callNow.phone}`}
            >
              <Phone className="h-5 w-5 text-brand-red flex-shrink-0" aria-hidden="true" />
              <span>Call: {siteConfig.ctas.callNow.phone}</span>
            </a>
          </div>

          {/* Reassurance text */}
          <p className="text-xs text-neutral-400">
            Same-day response available across Denver, Aurora, Lakewood, Littleton, Centennial, and surrounding areas.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default FinalCTA
