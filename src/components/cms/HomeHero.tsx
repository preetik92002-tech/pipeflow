'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SERVICES, ZIP_ERROR, isServiceZip } from '@/lib/requests/schema'

const DEFAULT_SERVICE = 'plumbing:water-heater-repair'

/** Background slides (decorative: the headline and copy carry the meaning). Slide 2 is intentionally not used. */
const SLIDES = ['/images/hero/slide-1.png', '/images/hero/slide-3.png']
const SLIDE_MS = 7000

/** Two photos that crossfade slowly behind the hero. With reduced motion the first photo stays still. */
function HeroBackdrop() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: ReturnType<typeof setInterval> | undefined
    const sync = () => {
      clearInterval(timer)
      if (query.matches) {
        setIndex(0)
        return
      }
      timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS)
    }
    sync()
    query.addEventListener('change', sync)
    return () => {
      clearInterval(timer)
      query.removeEventListener('change', sync)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 -z-20 select-none" aria-hidden="true" data-hero-backdrop>
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          loading="eager"
          className={`object-cover object-[72%_center] transition-opacity duration-[1600ms] ease-in-out motion-reduce:transition-none ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {/* Navy wash keeps the white text and the form readable over either photo. */}
      <div className="absolute inset-0 bg-navy-900/75 lg:bg-gradient-to-r lg:from-navy-900/90 lg:via-navy-900/60 lg:to-navy-900/35" />
    </div>
  )
}

/** Every service the request flow supports, as "category:value" options (the flow's own catalog, nothing extra). */
const OPTIONS = (['plumbing', 'hvac'] as const).flatMap((category) =>
  SERVICES[category].map((s) => ({ key: `${category}:${s.value}`, label: s.label, group: category === 'plumbing' ? 'Plumbing' : 'HVAC' }))
)

const field =
  'mt-1.5 w-full rounded-lg border border-white/20 bg-navy-800 px-3.5 py-3 text-base text-white placeholder:text-white/45 focus:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 aria-[invalid=true]:border-red-400'

/**
 * Home hero: text on the left, a compact request form on the right. The form only collects what the
 * visitor can type in seconds; it checks the ZIP and opens the full request flow with those answers
 * filled in, because a saved request also needs an address and contact details.
 */
export function HomeHero({ labelId }: { labelId?: string }) {
  const uid = useId()
  const [service, setService] = useState(DEFAULT_SERVICE)
  const [zip, setZip] = useState('')
  const [property, setProperty] = useState<'residential' | 'commercial'>('residential')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const value = zip.trim()
    if (!isServiceZip(value)) {
      setError(value ? ZIP_ERROR : 'Enter your ZIP code, for example 80202.')
      return
    }
    setError(null)
    setBusy(true)
    const [category, svc] = service.split(':')
    const params = new URLSearchParams({ category, service: svc, zip: value, type: property === 'commercial' ? 'business' : 'homeowner' })
    window.location.assign(`/book-service?${params.toString()}`)
    // If navigation stalls, let the visitor try again instead of leaving the button locked.
    setTimeout(() => setBusy(false), 8000)
  }

  return (
    <section data-hero className="relative isolate overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 text-white" aria-labelledby={labelId}>
      <HeroBackdrop />
      {/* Decorative mountains and skyline: layered shapes only, no text. Kept faint so the photos show through. */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[38%] min-h-[140px] w-full opacity-30" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 220 L140 120 L230 190 L380 60 L520 200 L640 110 L780 210 L920 80 L1080 200 L1220 120 L1340 190 L1440 140 V320 H0 Z" fill="#132952" opacity="0.7" />
        <path d="M0 260 L120 190 L260 250 L420 150 L560 255 L700 180 L860 260 L1010 170 L1160 255 L1300 200 L1440 250 V320 H0 Z" fill="#1A3566" opacity="0.75" />
        <path d="M0 300 L0 285 H60 V265 H95 V285 H150 V250 H190 V285 H1250 V270 H1290 V240 H1325 V270 H1380 V280 H1440 V300 Z" fill="#0B1728" opacity="0.6" />
        <path d="M0 320 V295 L200 275 L420 300 L700 280 L980 302 L1220 282 L1440 298 V320 Z" fill="#0B1728" />
      </svg>
      <div className="absolute -left-24 top-0 -z-10 h-80 w-80 rounded-full bg-brand-blue/25 blur-3xl" aria-hidden="true" />

      <div className="container-wide grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:py-20">
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

        <form id={`${uid}-form`} onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`} className="scroll-mt-32 rounded-2xl border border-white/15 bg-navy-900/90 p-5 shadow-2xl shadow-black/30 sm:p-7">
          <h2 id={`${uid}-title`} className="font-display text-2xl font-bold">
            Request Service
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor={`${uid}-service`} className="text-sm font-semibold text-white/90">
                Service needed
              </label>
              <select id={`${uid}-service`} className={field} value={service} onChange={(e) => setService(e.target.value)}>
                {(['Plumbing', 'HVAC'] as const).map((group) => (
                  <optgroup key={group} label={group}>
                    {OPTIONS.filter((o) => o.group === group).map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${uid}-zip`} className="text-sm font-semibold text-white/90">
                ZIP code
              </label>
              <input
                id={`${uid}-zip`}
                className={field}
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="e.g. 80202"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${uid}-zip-error` : undefined}
              />
              {error && (
                <p id={`${uid}-zip-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-300">
                  {error}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`${uid}-property`} className="text-sm font-semibold text-white/90">
                Property type
              </label>
              <select id={`${uid}-property`} className={field} value={property} onChange={(e) => setProperty(e.target.value as 'residential' | 'commercial')}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={busy} aria-busy={busy} className="btn-primary mt-6 w-full !py-3.5 text-base">
            {busy ? 'Opening request form…' : 'Request Service'}
          </button>
          <p className="mt-3 text-center text-xs text-white/65">Submitting a request does not guarantee immediate service or provider availability.</p>
          <p className="mt-2 text-center text-xs text-white/55">
            You&apos;ll add your address and contact details on the next step. <Link href="/book-service" className="underline underline-offset-2 hover:text-white">Start from scratch</Link>
          </p>
        </form>
      </div>
    </section>
  )
}
