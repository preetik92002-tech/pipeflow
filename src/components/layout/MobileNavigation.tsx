'use client'

import { useEffect, useRef } from 'react'
import { hasRealPhone } from '@/lib/config/contact'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X, Phone, ArrowRight, HardHat } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { NavItem, CTAConfig } from '@/types'
import { isActivePath } from './Navigation'

interface MobileNavigationProps {
  isOpen: boolean
  /** restoreFocus: true jab user ne khud band kiya (Escape / close button). */
  onClose: (restoreFocus: boolean) => void
  items: NavItem[]
  config: CTAConfig
  phone: string
}

export function MobileNavigation({ isOpen, onClose, items, config, phone }: MobileNavigationProps) {
  const pathname = usePathname()
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) closeButton.current?.focus()
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Escape band karta hai; Tab focus ko drawer ke andar hi ghumata hai (focus trap).
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(true)
      if (e.key !== 'Tab' || !panel.current) return
      const focusable = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Close on route change
  useEffect(() => {
    onClose(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => onClose(true)}
      />

      {/* Band hone par `inert`: drawer screen se bahar hai, to uske links Tab se bhi na mile. */}
      <div
        ref={panel}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        inert={!isOpen}
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-[min(88vw,400px)] flex-col bg-white shadow-2xl lg:hidden',
          'transition-transform duration-500 ease-out-expo',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <Image src="/assets/logo.png" alt="" width={1024} height={426} sizes="120px" className="h-auto w-[116px]" />
          <button
            ref={closeButton}
            onClick={() => onClose(true)}
            aria-label="Close navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-5 py-4">
          <ul>
            {items.map((item, i) => {
              const isActive = isActivePath(pathname, item.href)
              return (
                <li
                  key={item.href}
                  className={cn('border-b border-line transition-[opacity,transform] duration-500 ease-out-expo motion-reduce:transition-none', isOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0')}
                  style={{ transitionDelay: isOpen ? `${80 + i * 35}ms` : '0ms' }}
                >
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn('flex items-center justify-between py-4 font-display text-xl font-medium', isActive ? 'text-brand-red' : 'text-ink')}
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4 opacity-40" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex-shrink-0 space-y-3 border-t border-line p-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
          <Link href={config.bookService.href} className="cta cta-solid w-full">
            {config.bookService.label}
            <ArrowRight className="cta-arrow" aria-hidden="true" />
          </Link>
          {hasRealPhone(phone) && (
            <a href={`tel:${phone}`} className="cta cta-line w-full">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {phone}
            </a>
          )}
          <Link href={config.joinPro.href} className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-neutral-600 hover:text-ink">
            <HardHat className="h-4 w-4" aria-hidden="true" />
            {config.joinPro.label}
          </Link>
        </div>
      </div>
    </>
  )
}
export default MobileNavigation
