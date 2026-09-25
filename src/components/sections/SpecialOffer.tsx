'use client'

import Link from 'next/link'
import { Tag, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

export function SpecialOffer({ content }: { content?: { heading: string; description: string; ctaText: string; ctaUrl: string; image: string; active: boolean } }) {
  const original = siteConfig.defaultSpecialOffer
  const offer = content ? { ...original, title: content.heading, description: content.description, ctaText: content.ctaText, ctaHref: content.ctaUrl, active: content.active } : original

  if (!offer || !offer.active) return null

  return (
    <section aria-label="Seasonal Offer" className="py-12 bg-neutral-50 border-b border-neutral-200/80 overflow-hidden relative">
      <div className="container-site relative z-10">
        <ScrollReveal direction="up" distance={20}>
          <div className="relative rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-navy-700/60">
            {/* Subtle Background Glow */}
            <div
              className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-brand-red/15 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-red/20 border border-brand-red/40 px-3.5 py-1 text-xs font-bold text-red-200 uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5 text-brand-red flex-shrink-0" aria-hidden="true" />
                <span>{offer.badge}</span>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                {offer.title}
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 max-w-2xl">
                {offer.description}
              </p>

              {/* Promo Code & Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                {offer.discountCode && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 backdrop-blur-sm">
                    <Tag className="h-4 w-4 text-brand-blue-lighter" aria-hidden="true" />
                    <span className="text-xs text-neutral-300">Promo Code:</span>
                    <span className="text-sm font-mono font-bold text-white tracking-wider">
                      {offer.discountCode}
                    </span>
                  </div>
                )}

                <Link
                  href={offer.ctaHref}
                  className="btn-primary !py-3 !px-7 text-sm whitespace-nowrap shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <span>{offer.ctaText}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Disclaimer */}
              <p className="text-2xs text-neutral-400 max-w-xl">
                <ShieldCheck className="inline h-3 w-3 mr-1 text-neutral-500" aria-hidden="true" />
                {offer.disclaimer}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default SpecialOffer
