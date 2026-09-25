'use client'

import Link from 'next/link'
import { Phone, Calendar, FileText } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { useSiteSettings } from './SiteSettingsProvider'

export function StickyMobileCTA() {
  const { company } = useSiteSettings()
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200 shadow-lg lg:hidden"
      role="navigation"
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 divide-x divide-neutral-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <Link
          href={`tel:${company.phone}`}
          className="flex flex-col items-center justify-center gap-1 py-3 text-navy-800 hover:bg-neutral-50 transition-colors active:bg-neutral-100"
          aria-label={`Call ${company.phone}`}
        >
          <Phone className="h-5 w-5 text-brand-blue" aria-hidden="true" />
          <span className="text-xs font-semibold">Call</span>
        </Link>
        <Link
          href={siteConfig.ctas.bookService.href}
          className="flex flex-col items-center justify-center gap-1 py-3 bg-brand-red text-white hover:bg-brand-red-dark transition-colors active:bg-brand-red-dark"
          aria-label="Book a service"
        >
          <Calendar className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-bold">Book</span>
        </Link>
        <Link
          href={siteConfig.ctas.getQuote.href}
          className="flex flex-col items-center justify-center gap-1 py-3 text-navy-800 hover:bg-neutral-50 transition-colors active:bg-neutral-100"
          aria-label="Get a quote"
        >
          <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
          <span className="text-xs font-semibold">Quote</span>
        </Link>
      </div>
    </div>
  )
}
export default StickyMobileCTA
