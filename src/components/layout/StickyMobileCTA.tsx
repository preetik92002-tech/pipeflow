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

  // Keep the bar out of the way where it would only repeat or cover something: while a hero (which has its own
  // Request Service button) or a request form is on screen or being used, and on the request page itself.
  useEffect(() => {
    const targets = [...document.querySelectorAll<HTMLElement>('[data-hero], form[data-quick-request], form#request')]
    if (!targets.length) {
      setOverForm(false)
      return
    }
    const visible = new Set<Element>()
    let focused = false
    const update = () => setOverForm(visible.size > 0 || focused)
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target)
        else visible.delete(e.target)
      }
      update()
    })
    targets.forEach((t) => io.observe(t))
    const forms = targets.filter((t) => t.tagName === 'FORM')
    const onIn = () => {
      focused = true
      update()
    }
    const onOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && forms.some((f) => f.contains(e.relatedTarget as Node))) return
      focused = false
      update()
    }
    forms.forEach((f) => {
      f.addEventListener('focusin', onIn)
      f.addEventListener('focusout', onOut)
    })
    return () => {
      io.disconnect()
      forms.forEach((f) => {
        f.removeEventListener('focusin', onIn)
        f.removeEventListener('focusout', onOut)
      })
    }
  }, [pathname])

  if (pathname === nav.cta.href.split(/[?#]/)[0]) return null

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-md transition-transform duration-200 motion-reduce:transition-none lg:hidden ${overForm ? 'pointer-events-none translate-y-full' : ''}`}
      aria-hidden={overForm || undefined}
      inert={overForm}
      role="navigation"
      aria-label="Quick actions"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex gap-2 px-3 py-2">
        {hasPhone && (
          <a href={`tel:${company.phone}`} className="ui-btn ui-btn-secondary flex-none" aria-label={`Call ${company.phone}`}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
        )}
        <Link href={nav.cta.href} className="ui-btn ui-btn-primary flex-1">
          {nav.cta.label}
        </Link>
      </div>
    </div>
  )
}
export default StickyMobileCTA
