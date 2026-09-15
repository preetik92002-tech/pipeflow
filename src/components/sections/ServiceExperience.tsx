'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowRight, ShieldCheck, HeartHandshake, Compass } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

export function ServiceExperience() {
  const highlights = [
    {
      icon: Compass,
      title: 'No Guesswork or Hidden Fees',
      description:
        'You receive a comprehensive assessment and a fixed price upfront before any work begins. No surprises on your invoice.',
    },
    {
      icon: ShieldCheck,
      title: 'Skilled Tradespeople Who Care',
      description:
        'Our licensed plumbers and HVAC technicians are trained in the latest diagnostic tools and treat your home with meticulous cleanliness.',
    },
    {
      icon: HeartHandshake,
      title: 'Denver Metro Community Focus',
      description:
        'We live, work, and raise our families along the Colorado Front Range. Our reputation is built one honest job at a time.',
    },
  ]

  return (
    <section
      className="section-padding bg-white border-b border-neutral-200/80 overflow-hidden relative"
      aria-labelledby="experience-heading"
    >
      <div className="container-site relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Side (5 cols) */}
          <div className="lg:col-span-5 relative">
            <ScrollReveal direction="right" distance={30}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] max-w-md mx-auto lg:max-w-none group">
                <Image
                  src="/assets/service-detail-2.jpg"
                  alt="PipeFlow Co. technician inspecting residential fixtures with precision tools in Denver"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />

                {/* Floating Editorial Card */}
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-sm border border-neutral-100">
                  <p className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
                    The PipeFlow Guarantee
                  </p>
                  <p className="text-sm font-semibold text-navy-900 leading-snug">
                    Clean boots, clean workspaces, and honest upfront solutions.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Editorial Content Side (7 cols) */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="left" distance={30}>
              <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-2">
                The Homeowner Experience
              </p>
              <h2
                id="experience-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight mb-6"
              >
                Home Service Without the Headache
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-8">
                Plumbing leaks and HVAC outages are stressful enough without dealing with late arrivals,
                unclear jargon, or bait-and-switch pricing. At PipeFlow Co., we reimagined the service
                call around punctuality, crystal-clear communication, and enduring quality.
              </p>

              <div className="space-y-6 mb-10">
                {highlights.map((h, idx) => {
                  const Icon = h.icon
                  return (
                    <div key={h.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center flex-shrink-0 mt-1 shadow-2xs">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold font-heading text-navy-900 mb-1">
                          {h.title}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                          {h.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href={siteConfig.ctas.bookService.href}
                  className="btn-primary !py-3.5 !px-8 text-sm text-center hover:-translate-y-0.5 transition-all shadow-md shadow-brand-red/20"
                >
                  <span>Book a Consultation</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/services"
                  className="btn-outline !py-3.5 !px-7 text-xs sm:text-sm text-center hover:-translate-y-0.5 transition-all"
                >
                  <span>Explore All Services</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceExperience
