'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import type { Testimonial } from '@/types'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-600 fill-neutral-600'
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

interface ReviewCarouselProps {
  testimonials: Testimonial[]
}

export function ReviewCarousel({ testimonials }: ReviewCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonials.length)
  }, [testimonials.length])

  // Autoplay timer
  useEffect(() => {
    if (paused || testimonials.length <= 1) return
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [paused, next, testimonials.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prev, next])

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    if (distance > 50) {
      next()
    } else if (distance < -50) {
      prev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  if (!testimonials || testimonials.length === 0) return null

  const t = testimonials[current]

  return (
    <section
      className="section-padding bg-navy-900 overflow-hidden relative"
      aria-label="Customer testimonials and verified reviews"
      aria-roledescription="carousel"
    >
      <div className="container-site relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" distance={20} className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold text-brand-blue-lighter uppercase tracking-widest mb-2">
            Verified Front Range Feedback
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-4">
            What Colorado Homeowners Say
          </h2>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/20 border border-brand-blue/40 px-3.5 py-1 text-xs font-semibold text-brand-blue-lighter">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Honest, Transparent Plumbing &amp; HVAC Service</span>
          </div>
        </ScrollReveal>

        {/* Carousel Box with Swipe & Pause on Hover */}
        <ScrollReveal delay={150} direction="up" distance={24} className="relative max-w-3xl mx-auto">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="rounded-3xl bg-navy-800 border border-navy-700/80 p-8 sm:p-12 text-center shadow-2xl transition-all duration-300 relative overflow-hidden"
            role="group"
            aria-roledescription="slide"
            aria-label={`Testimonial ${current + 1} of ${testimonials.length}`}
          >
            <Quote className="h-10 w-10 text-brand-blue/30 mx-auto mb-6" aria-hidden="true" />
            
            <p className="text-lg sm:text-2xl text-neutral-100 font-serif leading-relaxed mb-6 italic transition-all duration-300 min-h-[100px] flex items-center justify-center">
              &ldquo;{t.reviewText}&rdquo;
            </p>

            <StarRating rating={t.rating} />

            <div className="mt-5">
              <p className="font-bold text-white text-base sm:text-lg">{t.reviewerName}</p>
              {t.reviewerCity && (
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">{t.reviewerCity}, Colorado</p>
              )}
              {t.serviceName && (
                <span className="inline-block mt-3 rounded-full bg-navy-700/80 border border-navy-600 px-3.5 py-1 text-xs text-brand-blue-lighter font-medium">
                  {t.serviceName}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Controls & Dot Indicators */}
          <div className="flex items-center justify-between sm:justify-center gap-6 mt-8">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="rounded-full border border-navy-700 bg-navy-800/80 p-3 text-neutral-300 hover:bg-navy-700 hover:text-white transition-all shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial pagination">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-300',
                    i === current ? 'w-8 bg-brand-blue' : 'w-2.5 bg-navy-700 hover:bg-navy-600'
                  )}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="rounded-full border border-navy-700 bg-navy-800/80 p-3 text-neutral-300 hover:bg-navy-700 hover:text-white transition-all shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue active:scale-95"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default ReviewCarousel
