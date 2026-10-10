'use client'

import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { useSiteSettings } from './SiteSettingsProvider'
import { useNavigation } from './NavigationProvider'
import { hasRealPhone } from '@/lib/config/contact'

export function StickyMobileCTA() {
  const { company } = useSiteSettings()
  const nav = useNavigation()
  const hasPhone = hasRealPhone(company.phone)

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-md lg:hidden"
      role="navigation"
      aria-label="Quick actions"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex gap-2 p-2.5">
        {hasPhone && (
          <a href={`tel:${company.phone}`} className="cta cta-line !min-h-[3rem] flex-none !px-5" aria-label={`Call ${company.phone}`}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
        )}
        <Link href={nav.cta.href} className="cta cta-solid !min-h-[3rem] flex-1">
          {nav.cta.label}
          <ArrowRight className="cta-arrow" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
export default StickyMobileCTA
