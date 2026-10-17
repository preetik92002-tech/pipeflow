'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone } from 'lucide-react'
import { useSiteSettings } from './SiteSettingsProvider'
import { useNavigation } from './NavigationProvider'
import { hasRealPhone } from '@/lib/config/contact'

export function StickyMobileCTA() {
  const { company } = useSiteSettings()
  const nav = useNavigation()
  const hasPhone = hasRealPhone(company.phone)
  const pathname = usePathname()
  const [overForm, setOverForm] = useState(false)

  // Home hero form: keep the bar out of the way while the form is on screen or being used, so it never covers the submit button.
  useEffect(() => {
    const form = document.querySelector<HTMLElement>('section[data-hero] form')
    if (!form) {
      setOverForm(false)
      return
    }
    let inView = false
    let focused = false
    const update = () => setOverForm(inView || focused)
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    })
    io.observe(form)
    const onIn = () => {
      focused = true
      update()
    }
    const onOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && form.contains(e.relatedTarget)) return
      focused = false
      update()
    }
    form.addEventListener('focusin', onIn)
    form.addEventListener('focusout', onOut)
    return () => {
      io.disconnect()
      form.removeEventListener('focusin', onIn)
      form.removeEventListener('focusout', onOut)
    }
  }, [pathname])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-md transition-transform duration-200 motion-reduce:transition-none lg:hidden ${overForm ? 'pointer-events-none translate-y-full' : ''}`}
      aria-hidden={overForm || undefined}
      inert={overForm}
      role="navigation"
      aria-label="Quick actions"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex gap-2 p-2.5">
        {hasPhone && (
          <a href={`tel:${company.phone}`} className="btn-outline !min-h-[3rem] flex-none !px-5" aria-label={`Call ${company.phone}`}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
        )}
        <Link href={nav.cta.href} className="btn-primary !min-h-[3rem] flex-1">
          {nav.cta.label}
        </Link>
      </div>
    </div>
  )
}
export default StickyMobileCTA
