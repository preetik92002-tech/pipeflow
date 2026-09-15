'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X, Phone, Calendar, FileText, ChevronRight, HardHat, Droplets, Wind } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { NavItem, CTAConfig } from '@/types'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
  config: CTAConfig
  phone: string
  onBookService?: () => void
}

export function MobileNavigation({ isOpen, onClose, items, config, phone, onBookService }: MobileNavigationProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on route change
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-[min(85vw,360px)] bg-white shadow-2xl',
          'transition-transform duration-300 ease-out lg:hidden flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 flex-shrink-0">
          <Image
            src="/assets/logo.png"
            alt="PipeFlow Co."
            width={140}
            height={50}
            className="h-9 w-auto"
          />
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Service quick links */}
        <div className="flex gap-2 px-4 py-3 border-b border-neutral-100 flex-shrink-0">
          <Link
            href="/services?category=plumbing"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 py-2 text-xs font-semibold text-brand-blue"
          >
            <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
            Plumbing
          </Link>
          <Link
            href="/services?category=hvac"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-orange-50 border border-orange-100 py-2 text-xs font-semibold text-orange-600"
          >
            <Wind className="h-3.5 w-3.5" aria-hidden="true" />
            HVAC
          </Link>
        </div>

        {/* Nav links */}
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-4 py-3">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-brand-blue font-semibold'
                        : 'text-navy-800 hover:bg-neutral-50'
                    )}
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 opacity-30" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* CTA section */}
        <div className="border-t border-neutral-100 p-4 space-y-2 flex-shrink-0">
          {onBookService ? (
            <button
              type="button"
              onClick={() => { onClose(); onBookService(); }}
              className="btn-primary w-full justify-center"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {config.bookService.label}
            </button>
          ) : (
            <Link
              href={config.bookService.href}
              className="btn-primary w-full justify-center"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {config.bookService.label}
            </Link>
          )}
          <Link
            href={config.getQuote.href}
            className="btn-outline w-full justify-center"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {config.getQuote.label}
          </Link>
          <Link
            href={`tel:${phone}`}
            className="btn-secondary w-full justify-center"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {phone}
          </Link>
          <Link
            href={config.joinPro.href}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-blue hover:bg-blue-50 transition-colors"
          >
            <HardHat className="h-4 w-4" aria-hidden="true" />
            {config.joinPro.label}
          </Link>
        </div>
      </div>
    </>
  )
}
export default MobileNavigation
