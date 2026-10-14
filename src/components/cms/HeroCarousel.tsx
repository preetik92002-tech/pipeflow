'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { CmsButton } from '@/lib/cms-pages/links'
import { CmsButtons } from './CmsButtons'

const SLIDES = [
  { src: '/images/hero/slide-1.jpg', alt: 'PipeFlow technician heading to a Colorado home: Comfort starts here' },
  { src: '/images/hero/slide-2.jpg', alt: 'PipeFlow technician servicing an air conditioner: save $1,500 on an AC and furnace bundle' },
  { src: '/images/hero/slide-3.jpg', alt: 'PipeFlow technician and van with the Denver skyline: your home, our priority' },
]

/** Three promo banners that slide across on their own. Pauses on hover/focus; no auto-advance with reduced motion. */
export function HeroCarousel({ heading, buttons, labelId }: { heading: string; buttons: CmsButton[]; labelId?: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section
      className="relative bg-navy-900"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h1 id={labelId} className="sr-only">
        {heading}
      </h1>
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
          {SLIDES.map((s, i) => (
            <div key={s.src} className="relative aspect-[1600/587] w-full shrink-0" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${SLIDES.length}`} aria-hidden={i !== index}>
              <div className={`absolute inset-0 ${i === index ? 'hero-kenburns' : ''}`}>
                <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="100vw" quality={70} className="object-contain sm:object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900">
        <div className="container-wide flex flex-col items-stretch gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <CmsButtons buttons={buttons} onDark className="" />
          <div className="flex justify-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-7 bg-brand-red' : 'w-2.5 bg-white/60 hover:bg-white'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
