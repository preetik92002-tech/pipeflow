'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useNavigation } from '@/components/layout/NavigationProvider'

/** Hero photographs (decorative: the headline and copy carry the meaning). Slide 2 is intentionally not used. */
const SLIDES = ['/images/hero/slide-1.png', '/images/hero/slide-3.png']
const SLIDE_MS = 7000

/** Two photos that crossfade slowly. With reduced motion the first photo stays still. */
function HeroPhotos() {
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
    <>
      {SLIDES.map((src, i) => {
        // Keep the first-screen request focused on the LCP photo. The alternate
        // slide only needs to enter the DOM when the carousel reaches it.
        if (i > 0 && index === 0) return null
        return (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="100vw"
            preload={i === 0}
            className={`object-cover object-[78%_center] transition-opacity duration-[1600ms] ease-in-out motion-reduce:transition-none lg:object-right ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        )
      })}
    </>
  )
}

/**
 * Home hero. Desktop: the photograph fills the band and the copy sits on its navy left side, with only a light
 * gradient where the text is. Phones: the photo is a short band on top and the copy follows on navy, so the
 * headline and the main action are on the first screen without a full-screen hero.
 */
export function HomeHero({ labelId }: { labelId?: string }) {
  const nav = useNavigation()
  return (
    <section data-hero className="relative isolate overflow-hidden bg-navy-900 text-white" aria-labelledby={labelId}>
      <div className="pointer-events-none relative aspect-[16/9] select-none sm:aspect-[21/9] lg:absolute lg:inset-0 lg:aspect-auto" aria-hidden="true" data-hero-backdrop>
        <HeroPhotos />
        {/* Only as much shade as the text needs: none over the people in the photo. */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/10 to-transparent lg:bg-gradient-to-r lg:from-navy-900/95 lg:via-navy-900/55 lg:via-45% lg:to-transparent lg:to-70%" />
      </div>

      <div className="container-wide relative lg:flex lg:min-h-[520px] lg:items-center xl:min-h-[560px]">
        <div className="max-w-[40rem] pb-10 pt-1 lg:py-16">
          <h1 id={labelId} className="font-display text-display-2xl font-semibold text-white [text-wrap:balance]">
            Reliable Plumbing &amp; HVAC Solutions for Your Home and Business
          </h1>
          <p className="mt-4 max-w-lg text-[1.05rem] leading-relaxed text-white/85 lg:text-lg">
            Explore plumbing and HVAC services in Denver, Boulder and nearby communities, then send one simple request. We&apos;ll follow up about availability and next steps.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={nav.cta.href} className="ui-btn ui-btn-primary px-7 text-base">
              {nav.cta.label}
            </Link>
            <a href="#services" className="ui-btn ui-btn-on-dark px-7 text-base">
              Find a Service
            </a>
          </div>
          <p className="mt-4 max-w-lg text-[0.8rem] leading-relaxed text-white/65">
            Residential and commercial inquiries welcome. Submitting a request does not guarantee immediate service or provider availability.
          </p>
        </div>
      </div>
    </section>
  )
}
