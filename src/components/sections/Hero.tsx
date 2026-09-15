'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, FileText } from 'lucide-react'
import { cn } from '@/lib/cn'
import { siteConfig } from '@/lib/config/site'

// ─── Slide configuration ──────────────────────────────────────────────────────
// Images are wide advertising banners (~3:1). Important content is on the left.
// desktop/mobile object-position controls what stays in frame on small screens.

interface SlideConfig {
  src: string
  alt: string
  /** CSS object-position for desktop (md+) */
  desktopPosition: string
  /** CSS object-position for mobile */
  mobilePosition: string
}

const SLIDES: SlideConfig[] = [
  {
    src: '/assets/scrol1.png',
    alt: 'PipeFlow Co. — Fast. Reliable. Right on Time. Denver Plumbing & HVAC technician with service van.',
    desktopPosition: 'center center',
    mobilePosition: 'left center',
  },
  {
    src: '/assets/scrol2.png',
    alt: 'PipeFlow Co. — Comfort Starts Here. Colorado plumbing and HVAC technician arriving at home.',
    desktopPosition: 'center center',
    mobilePosition: 'left center',
  },
  {
    src: '/assets/scrol3.png',
    alt: 'PipeFlow Co. — Colorado Comfort All Year Long. Trusted local HVAC experts servicing AC unit.',
    desktopPosition: 'center center',
    mobilePosition: 'left center',
  },
]

const SLIDE_DURATION_MS = 6000
const TRANSITION_MS = 900

interface HeroProps {
  /** Called when the user selects a service category (for downstream section sync) */
  onSelectCategory?: (category: 'plumbing' | 'hvac') => void
  /** Called when "Book a Service" is clicked — use to open modal */
  onBookService?: () => void
}

export function Hero({ onBookService }: HeroProps) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heroRef = useRef<HTMLElement>(null)

  // Touch / swipe state
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  // ── Detect reduced motion preference ───────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // ── Advance to next slide ───────────────────────────────────────────────────
  const goToSlide = useCallback(
    (next: number) => {
      if (isTransitioning) return
      setPrev(current)
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrent(next)
        setPrev(null)
        setIsTransitioning(false)
      }, TRANSITION_MS)
    },
    [current, isTransitioning]
  )

  const nextSlide = useCallback(() => {
    goToSlide((current + 1) % SLIDES.length)
  }, [current, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((current - 1 + SLIDES.length) % SLIDES.length)
  }, [current, goToSlide])

  // ── Auto-advance timer ──────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!isPaused) nextSlide()
    }, SLIDE_DURATION_MS)
  }, [isPaused, nextSlide])

  useEffect(() => {
    if (!isPaused) startTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPaused, current, startTimer])

  // ── Pause when tab is hidden ────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsPaused(document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  // ── Touch / swipe handlers ──────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only handle horizontal swipes (not scroll)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx < 0 ? nextSlide() : prevSlide()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  // ── Keyboard support ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const hero = heroRef.current
      if (!hero || !hero.contains(document.activeElement)) return
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prevSlide, nextSlide])

  const handleBookService = () => {
    if (onBookService) {
      onBookService()
    }
  }

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden bg-navy-900"
      style={{ height: 'clamp(480px, 58vw, 780px)' }}
      aria-label="PipeFlow Co. — Plumbing & HVAC Services"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Slide layers ── */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === current
        const isPrev = idx === prev

        return (
          <div
            key={slide.src}
            aria-hidden={!isActive}
            className={cn(
              'absolute inset-0 transition-opacity',
              isActive ? 'opacity-100 z-10' : isPrev ? 'opacity-0 z-20' : 'opacity-0 z-0'
            )}
            style={{
              transitionDuration: prefersReducedMotion ? '100ms' : `${TRANSITION_MS}ms`,
              transitionTimingFunction: 'ease-in-out',
            }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={idx === 0}
              loading={idx === 0 ? 'eager' : idx === 1 ? 'eager' : 'lazy'}
              quality={idx === 0 ? 90 : 80}
              sizes="100vw"
              className={cn(
                'w-full h-full select-none',
                // Use contain on desktop so the wide-format banner shows fully,
                // and cover on mobile so it fills the viewport without being tiny
                'object-cover',
                // Ken Burns — only when slide is active and no reduced-motion
                isActive && !prefersReducedMotion && 'animate-hero-ken-burns'
              )}
              style={{
                objectPosition: 'center center',
              }}
              draggable={false}
            />

            {/* Very subtle dark gradient at the bottom so the buttons read clearly */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>
        )
      })}

      {/* ── CTA Button Layer — ONLY two buttons, fixed position on the image ── */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 pointer-events-none"
        aria-label="Service booking options"
      >
        <div className="pointer-events-auto px-4 sm:px-8 lg:px-12 pb-8 sm:pb-10 lg:pb-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-lg lg:max-w-xl">
          {/* BOOK A SERVICE */}
          <button
            type="button"
            onClick={handleBookService}
            className={cn(
              'group flex items-center justify-center gap-2.5',
              'px-7 py-3.5 sm:py-4',
              'text-sm sm:text-base font-bold text-white tracking-wide',
              'bg-brand-red hover:bg-brand-red-dark',
              'rounded-xl',
              'shadow-lg shadow-black/30',
              'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50'
            )}
            aria-label="Book a plumbing or HVAC service with PipeFlow"
          >
            <Calendar className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
            <span>Book a Service</span>
          </button>

          {/* GET A QUOTE */}
          <Link
            href={siteConfig.ctas.getQuote.href}
            className={cn(
              'group flex items-center justify-center gap-2.5',
              'px-7 py-3.5 sm:py-4',
              'text-sm sm:text-base font-bold text-white tracking-wide',
              'bg-white/15 hover:bg-white/25',
              'border border-white/50 hover:border-white/80',
              'rounded-xl',
              'backdrop-blur-sm',
              'shadow-md shadow-black/20',
              'hover:-translate-y-0.5 hover:shadow-lg',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50'
            )}
            aria-label="Get a free plumbing or HVAC quote from PipeFlow"
          >
            <FileText className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
            <span>Get a Quote</span>
          </Link>
        </div>
      </div>

      {/* ── Slide indicators ── */}
      <div
        className="absolute bottom-5 right-6 sm:right-8 z-30 flex items-center gap-2"
        role="tablist"
        aria-label="Slide indicators"
      >
        {SLIDES.map((slide, idx) => (
          <button
            key={idx}
            role="tab"
            aria-selected={idx === current}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => goToSlide(idx)}
            className={cn(
              'rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white',
              idx === current
                ? 'w-5 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>

      {/* Screen-reader live region for slide announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {SLIDES[current].alt}
      </div>

      {/* Preload next slide */}
      <link
        rel="preload"
        as="image"
        href={SLIDES[(current + 1) % SLIDES.length].src}
      />
    </section>
  )
}

export default Hero
