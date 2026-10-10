'use client'

import Link from 'next/link'
import { Phone, Calendar } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { useBookingModal } from '@/components/booking/BookingModalProvider'
import { useSiteSettings } from './SiteSettingsProvider'
import { hasRealPhone } from '@/lib/config/contact'

export function StickyMobileCTA() {
  const { company } = useSiteSettings()
  const { openModal } = useBookingModal()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200 shadow-lg lg:hidden"
      role="navigation"
      aria-label="Quick actions"
    >
      <div className={`grid divide-x divide-neutral-200 ${hasRealPhone(company.phone) ? 'grid-cols-2' : 'grid-cols-1'}`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {hasRealPhone(company.phone) && (
          <Link
            href={`tel:${company.phone}`}
            className="flex items-center justify-center gap-2 py-3.5 text-navy-800 hover:bg-neutral-50 transition-colors active:bg-neutral-100"
            aria-label={`Call ${company.phone}`}
          >
            <Phone className="h-5 w-5 text-brand-blue" aria-hidden="true" />
            <span className="text-sm font-semibold">Call</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => openModal()}
          className="flex w-full items-center justify-center gap-2 bg-brand-red py-3.5 text-white transition-colors hover:bg-brand-red-dark active:bg-brand-red-dark"
        >
          <Calendar className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-bold">{siteConfig.ctas.bookService.label}</span>
        </button>
      </div>
    </div>
  )
}
export default StickyMobileCTA
