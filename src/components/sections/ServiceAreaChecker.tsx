'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Search, CheckCircle2, AlertCircle, Phone, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

export function ServiceAreaChecker() {
  const [zipInput, setZipInput] = useState('')
  const [checkResult, setCheckResult] = useState<{
    searched: boolean
    covered: boolean
    areaName?: string
  } | null>(null)

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = zipInput.trim()
    if (!trimmed) return

    // Search against approved areas
    let match = siteConfig.defaultServiceAreas.find(
      (area) => area.zipCodes && area.zipCodes.includes(trimmed)
    )

    // Also match if user typed city name
    if (!match) {
      match = siteConfig.defaultServiceAreas.find(
        (area) => area.name.toLowerCase() === trimmed.toLowerCase()
      )
    }

    if (match) {
      setCheckResult({ searched: true, covered: true, areaName: match.name })
    } else {
      setCheckResult({ searched: true, covered: false })
    }
  }

  return (
    <section
      id="service-areas"
      className="section-padding bg-white border-b border-neutral-200/80 scroll-mt-20 overflow-hidden relative"
      aria-labelledby="coverage-heading"
    >
      <div className="container-site relative z-10">
        {/* Header */}
        <ScrollReveal direction="up" distance={20} className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Colorado Coverage</span>
          </div>
          <h2
            id="coverage-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight mb-4"
          >
            Check Service Availability
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg">
            PipeFlow Co. proudly provides fast dispatch across Denver, Arapahoe, Jefferson, Adams,
            and Douglas counties.
          </p>
        </ScrollReveal>

        {/* Interactive ZIP / City Checker Box */}
        <ScrollReveal delay={120} direction="up" distance={20} className="max-w-xl mx-auto mb-14">
          <form
            onSubmit={handleCheck}
            className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-sm"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={zipInput}
                onChange={(e) => {
                  setZipInput(e.target.value)
                  if (checkResult) setCheckResult(null)
                }}
                placeholder="Enter 5-digit ZIP code or Denver city..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-sm text-navy-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <button
              type="submit"
              className="btn-primary !py-3 !px-6 text-sm whitespace-nowrap shadow-xs hover:shadow-md"
            >
              Check Availability
            </button>
          </form>

          {/* Instant Result Card */}
          {checkResult && checkResult.searched && (
            <div className="mt-4 animate-fade-in">
              {checkResult.covered ? (
                <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 flex items-start gap-3.5 shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-bold">
                      Great news! PipeFlow actively serves {checkResult.areaName}, Colorado.
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Same-day plumbing and HVAC dispatch is available in your neighborhood.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Link
                        href={`/book?area=${checkResult.areaName?.toLowerCase()}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors shadow-xs"
                      >
                        Book in {checkResult.areaName}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                      <a
                        href={`tel:${siteConfig.company.phone}`}
                        className="text-xs font-semibold text-green-800 hover:underline"
                      >
                        or call {siteConfig.company.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5 shadow-xs">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-bold">
                      We are expanding our Denver service routes!
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      While this specific location may be just outside our core zone, please call our
                      dispatch team directly. We frequently accommodate surrounding Front Range properties.
                    </p>
                    <a
                      href={`tel:${siteConfig.company.phone}`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 bg-amber-200/80 px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-brand-red" />
                      Call Dispatch: {siteConfig.company.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollReveal>

        {/* Location Cards Grid */}
        <ScrollReveal delay={200} direction="up" distance={20} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {siteConfig.defaultServiceAreas.map((area) => (
            <Link
              key={area.id}
              href={`/service-areas/${area.slug}`}
              className={`group flex items-center justify-between rounded-xl border p-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 hover:shadow-card hover:-translate-y-1 ${
                area.primary
                  ? 'border-brand-blue/40 bg-blue-50/70 text-brand-blue hover:bg-brand-blue hover:text-white'
                  : 'border-neutral-200 bg-white text-navy-800 hover:border-brand-blue/30 hover:bg-blue-50/50 hover:text-brand-blue'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-brand-blue group-hover:text-current" />
                <span className="truncate">{area.name}</span>
              </div>
              {area.primary && (
                <span className="text-2xs font-normal opacity-70 ml-1">CO</span>
              )}
            </Link>
          ))}
        </ScrollReveal>

        {/* Custom Coverage Note */}
        <ScrollReveal delay={280} direction="up" className="text-center text-xs text-neutral-500">
          <span>Need service in Boulder, Longmont, or Castle Pines? </span>
          <Link href="/contact" className="font-semibold text-brand-blue hover:underline">
            Contact dispatch for route availability
          </Link>
          .
        </ScrollReveal>
      </div>
    </section>
  )
}

export default ServiceAreaChecker
