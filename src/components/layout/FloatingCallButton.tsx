'use client'

import { useState, useEffect } from 'react'
import { Phone } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

export function FloatingCallButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down 300px
      setVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <aside
      aria-label="Direct Phone Assistance"
      className="hidden lg:block fixed bottom-6 left-6 z-40 animate-slide-up"
    >
      <a
        href={`tel:${siteConfig.company.phone}`}
        className="group flex items-center gap-3 bg-navy-900 text-white rounded-full pl-3.5 pr-5 py-2.5 shadow-2xl border border-white/20 hover:bg-brand-red transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        <span className="w-8 h-8 rounded-full bg-brand-red group-hover:bg-white text-white group-hover:text-brand-red flex items-center justify-center transition-colors shadow-sm">
          <Phone className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="text-left">
          <p className="text-2xs font-bold text-neutral-300 group-hover:text-white uppercase tracking-wider leading-none">
            24/7 Dispatch
          </p>
          <p className="text-sm font-bold text-white tracking-tight leading-snug">
            {siteConfig.company.phone}
          </p>
        </div>
      </a>
    </aside>
  )
}
export default FloatingCallButton
