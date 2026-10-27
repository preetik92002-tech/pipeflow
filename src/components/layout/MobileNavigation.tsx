'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, Phone, X } from 'lucide-react'
import { hasRealPhone } from '@/lib/config/contact'
import { cn } from '@/lib/cn'
import type { MenuItem } from '@/lib/cms-pages/menu'
import { isActivePath } from './Navigation'

interface MobileNavigationProps {
  isOpen: boolean
  /** restoreFocus: true jab user ne khud band kiya (Escape / close button). */
  onClose: (restoreFocus: boolean) => void
  items: MenuItem[]
  cta: { label: string; href: string }
  contractors?: { label: string; href: string }
  joinPro?: { label: string; href: string }
  phone: string
}

/** Slide-in menu for phones and tablets. Groups open in place (disclosures) so the list stays short. */
export function MobileNavigation({ isOpen, onClose, items, cta, contractors, joinPro, phone }: MobileNavigationProps) {
  const pathname = usePathname()
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

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
      const focusable = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
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
        className={cn('fixed inset-0 z-40 bg-ink/50 transition-opacity duration-200 lg:hidden', isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}
        onClick={() => onClose(true)}
      />

      {/* Band hone par`inert`: drawer screen se bahar hai, to uske links Tab se bhi na mile. */}
      <div
        ref={panel}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        inert={!isOpen}
        className={cn(
          'fixed right-0 top-0 z-50 flex h-[100dvh] w-[min(88vw,380px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out-expo lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-line px-4">
          <Image src="/assets/logo.png" alt="" width={1024} height={426} sizes="112px" className="h-auto w-[104px]" />
          <button
            ref={closeButton}
            onClick={() => onClose(true)}
            aria-label="Close navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-paper dark:hover:bg-[#132952]"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          <ul>
            {items.map((item) => {
              const active = isActivePath(pathname, item.href) || item.children.some((c) => isActivePath(pathname, c.href))
              const open = expanded === item.href
              const rowCls = cn('flex min-h-[3rem] flex-1 items-center rounded-lg px-3 text-[1.02rem] font-semibold', active ? 'text-terra' : 'text-ink')
              return (
                <li key={item.href} className="border-b border-line/70 last:border-b-0">
                  <div className="flex items-center">
                    <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={rowCls}>
                      {item.label}
                    </Link>
                    {item.children.length > 0 && (
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`m-${item.href}`}
                        aria-label={`Show ${item.label} pages`}
                        onClick={() => setExpanded(open ? null : item.href)}
                        className="flex h-11 w-11 flex-none items-center justify-center rounded-lg text-ink/70 hover:bg-paper dark:hover:bg-[#132952]"
                      >
                        <ChevronDown className={cn('h-5 w-5 transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {item.children.length > 0 && (
                    <ul id={`m-${item.href}`} hidden={!open} className="pb-2 pl-3">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            aria-current={pathname === c.href ? 'page' : undefined}
                            className={cn('flex min-h-[2.75rem] items-center rounded-lg px-3 text-[0.95rem]', pathname === c.href ? 'font-semibold text-terra' : 'text-neutral-700')}
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex-shrink-0 space-y-2 border-t border-line p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <Link href={cta.href} className="ui-btn ui-btn-primary w-full">
            {cta.label}
          </Link>
          {hasRealPhone(phone) && (
            <a href={`tel:${phone}`} className="ui-btn ui-btn-secondary w-full">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {phone}
            </a>
          )}
          {(contractors || joinPro) && (
            <p className="flex flex-wrap items-center justify-center gap-x-4 text-sm font-semibold text-neutral-600">
              {contractors && (
                <Link href={contractors.href} className="inline-flex min-h-[2.75rem] items-center hover:text-ink dark:hover:text-[#EAF1FB]">
                  For Contractors
                </Link>
              )}
              {joinPro && joinPro.href !== contractors?.href && (
                <Link href={joinPro.href} className="inline-flex min-h-[2.75rem] items-center hover:text-ink dark:hover:text-[#EAF1FB]">
                  {joinPro.label}
                </Link>
              )}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
export default MobileNavigation
