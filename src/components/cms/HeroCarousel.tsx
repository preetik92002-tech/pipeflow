'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SLIDES = [
  { src: '/images/hero/slide-1.jpg', alt: 'PipeFlow technician heading to a Colorado home: Comfort starts here' },
  { src: '/images/hero/slide-2.jpg', alt: 'PipeFlow technician servicing an air conditioner: save $1,500 on an AC and furnace bundle' },
  { src: '/images/hero/slide-3.jpg', alt: 'PipeFlow technician and van with the Denver skyline: your home, our priority' },
]

/** Three promo banners that slide across on their own. Pauses on hover/focus; no auto-advance with reduced motion. */
export function HeroCarousel({ heading, labelId }: { heading: string; labelId?: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section
      className="relative z-[2] bg-navy-900"
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
                <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="100vw" className="object-contain sm:object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-9 flex flex-col items-start gap-2 px-3 sm:bottom-14 sm:gap-3 sm:px-10">
        <Link href="/book-service" className="btn-primary !min-w-[8.5rem] !px-6 !py-2 text-xs shadow-xl sm:!min-w-[14rem] sm:!px-10 sm:!py-3.5 sm:text-base">
          Book Now
        </Link>
        <Link href="/contact" className="inline-flex min-w-[8.5rem] items-center justify-center rounded-lg border-2 border-white bg-navy-900/70 px-6 py-2 text-xs font-bold text-white shadow-xl backdrop-blur transition-colors hover:bg-white hover:text-navy-900 sm:min-w-[14rem] sm:px-10 sm:py-3.5 sm:text-base">
          Get in Touch
        </Link>
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-7 bg-brand-red' : 'w-2.5 bg-white/70 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  )
}
