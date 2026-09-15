'use client'

import Image from 'next/image'
import Link from 'next/link'
import { HardHat, ArrowRight, CheckCircle2 } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

const proBenefits = [
  'Consistent residential dispatch pipeline across Denver and Front Range',
  'Prompt, reliable weekly payouts and competitive compensation',
  'Professional dispatch, administrative, and inventory support',
  'Collaborative culture with veteran master trades mentors',
]

export function PartnerCTA() {
  return (
    <section
      id="join-pro"
      className="section-padding bg-navy-950 text-white border-b border-navy-800 scroll-mt-20 overflow-hidden relative"
      aria-labelledby="pro-heading"
    >
      <div className="container-site relative z-10">
        <ScrollReveal direction="up" distance={24}>
          <div className="rounded-3xl bg-navy-900 border border-navy-800 p-8 sm:p-12 lg:p-14 overflow-hidden relative shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              {/* Content Side (7 cols) */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 border border-brand-blue/40 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
                  <HardHat className="h-4 w-4" aria-hidden="true" />
                  <span>Career &amp; Contractor Network</span>
                </div>

                <h2
                  id="pro-heading"
                  className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-4"
                >
                  Are You a Plumbing or HVAC Professional?
                </h2>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
                  Whether you are a licensed journeyman looking for stable high-volume work, an independent contractor seeking local route partnerships, or an experienced technician ready for a team that values your craft — explore joining PipeFlow Co.
                </p>

                <ul className="space-y-3 mb-8" aria-label="Benefits for trade professionals">
                  {proBenefits.map((benefit, index) => (
                    <li key={benefit} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    href="/join-us"
                    className="btn-primary !py-3.5 !px-8 text-sm text-center shadow-md shadow-brand-red/20 hover:-translate-y-0.5 transition-all"
                  >
                    <span>Join PipeFlow</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/about"
                    className="btn-outline !text-white !border-neutral-600 hover:!border-white hover:!bg-white/10 text-xs sm:text-sm text-center hover:-translate-y-0.5 transition-all"
                  >
                    <span>Learn Our Culture &amp; Standards</span>
                  </Link>
                </div>
              </div>

              {/* Supplied Professional Action Photo (5 cols) */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] border border-navy-700 group">
                  <Image
                    src="/assets/service-detail-1.jpg"
                    alt="PipeFlow Co. licensed technician working on residential water fixtures"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 bg-navy-900/90 backdrop-blur-xs p-3.5 rounded-xl border border-navy-700 text-xs">
                    <p className="font-bold text-white">Denver Metro Opportunities</p>
                    <p className="text-neutral-400 text-2xs mt-0.5">Licensed Plumbers &bull; HVAC Installers &bull; Service Techs</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default PartnerCTA
