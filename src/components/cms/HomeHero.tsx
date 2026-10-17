'use client'

import { useId } from 'react'

/** Home hero: headline, supporting copy and two actions over a navy mountain backdrop. */
export function HomeHero({ labelId }: { labelId?: string }) {
  const uid = useId()

  return (
    <section data-hero className="relative isolate overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 text-white" aria-labelledby={labelId}>
      {/* Decorative mountains and skyline: layered shapes only, no text. */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[38%] min-h-[140px] w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 220 L140 120 L230 190 L380 60 L520 200 L640 110 L780 210 L920 80 L1080 200 L1220 120 L1340 190 L1440 140 V320 H0 Z" fill="#132952" opacity="0.7" />
        <path d="M0 260 L120 190 L260 250 L420 150 L560 255 L700 180 L860 260 L1010 170 L1160 255 L1300 200 L1440 250 V320 H0 Z" fill="#1A3566" opacity="0.75" />
        <path d="M0 300 L0 285 H60 V265 H95 V285 H150 V250 H190 V285 H1250 V270 H1290 V240 H1325 V270 H1380 V280 H1440 V300 Z" fill="#0B1728" opacity="0.6" />
        <path d="M0 320 V295 L200 275 L420 300 L700 280 L980 302 L1220 282 L1440 298 V320 Z" fill="#0B1728" />
      </svg>
      <div className="absolute -left-24 top-0 -z-10 h-80 w-80 rounded-full bg-brand-blue/25 blur-3xl" aria-hidden="true" />

      <div className="container-wide py-12 sm:py-16 lg:py-20">
        <div>
          <h1 id={labelId} className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            Reliable Plumbing &amp; HVAC Solutions for Your Home and Business
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            PipeFlowCo helps you explore plumbing and HVAC services in Denver, Boulder, and surrounding Colorado communities where service coverage is available. Tell us what&apos;s going on and send your request in a few minutes. We&apos;ll follow up about availability and next steps.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={`#${uid}-form`} className="btn-primary !px-7 !py-3 text-base">
              Request Service
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/70 px-7 py-3 text-base font-semibold text-white transition hover:bg-white hover:text-navy-800 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              Find a Service
            </a>
          </div>
          <p className="mt-5 max-w-xl text-sm text-white/70">Residential and commercial inquiries welcome. Submitting a request does not guarantee immediate service or provider availability.</p>
        </div>

      </div>
    </section>
  )
}
