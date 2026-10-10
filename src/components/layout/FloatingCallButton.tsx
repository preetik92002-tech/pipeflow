'use client'

import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { useSiteSettings } from './SiteSettingsProvider'
import { hasRealPhone } from '@/lib/config/contact'

/** Desktop par scroll ke baad dikhne wala call button. Sirf asli phone number ho tab render hota hai. */
export function FloatingCallButton() {
  const [visible, setVisible] = useState(false)
  const { company } = useSiteSettings()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible || !hasRealPhone(company.phone)) return null

  return (
    <aside aria-label="Call us" className="fixed bottom-6 left-6 z-40 hidden animate-rise lg:block">
      <a
        href={`tel:${company.phone}`}
        className="group flex items-center gap-3 bg-ink py-2 pl-2 pr-5 text-white shadow-[0_18px_40px_-16px_rgba(11,23,40,0.7)] transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-terra focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra"
      >
        <span className="flex h-10 w-10 items-center justify-center bg-terra transition-colors group-hover:bg-white group-hover:text-terra">
          <Phone className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold">{company.phone}</span>
      </a>
    </aside>
  )
}
export default FloatingCallButton
