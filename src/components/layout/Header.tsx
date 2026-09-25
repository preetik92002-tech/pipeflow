'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, Calendar, FileText, Menu } from 'lucide-react'
import { Navigation } from './Navigation'
import { MobileNavigation } from './MobileNavigation'
import { AnnouncementBar } from './AnnouncementBar'
import { useBookingModal } from '@/components/booking/BookingModalProvider'
import { siteConfig } from '@/lib/config/site'
import { cn } from '@/lib/cn'
import { useSiteSettings } from './SiteSettingsProvider'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { openModal } = useBookingModal()
  const { company, announcementMessages } = useSiteSettings()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {announcementMessages.length > 0 && <AnnouncementBar messages={announcementMessages} />}
      <header
        className={cn(
          'sticky top-0 z-40 w-full bg-white transition-all duration-300',
          isScrolled
            ? 'shadow-nav border-b border-neutral-100'
            : 'border-b border-neutral-100/50'
        )}
        role="banner"
      >
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-brand-blue focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>

        <div className="container-site">
          <div className="flex items-center justify-between h-16 lg:h-[72px] gap-3">

            {/* Logo */}
            <Link
              href="/"
              aria-label="PipeFlow Co. — Home"
              className="flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue rounded group"
            >
              <Image
                src="/assets/logo.png"
                alt="PipeFlow Co. Plumbing & HVAC Services — Denver, Colorado"
                width={200}
                height={72}
                className="w-[105px] sm:w-[125px] lg:w-[140px] h-auto object-contain group-hover:scale-[1.02] transition-transform duration-200"
                priority
              />
            </Link>

            {/* Desktop nav — hidden below lg */}
            <Navigation items={siteConfig.nav} className="hidden lg:flex flex-1 justify-center" />

            {/* Desktop CTA cluster */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <Link
                href={`tel:${company.phone}`}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 hover:bg-neutral-100 transition-colors"
                aria-label={`Call us: ${company.phone}`}
              >
                <Phone className="h-3.5 w-3.5 text-brand-red" aria-hidden="true" />
                <span className="hidden xl:inline text-sm font-semibold">{company.phone}</span>
                <span className="xl:hidden text-sm font-semibold">Call</span>
              </Link>

              <Link
                href={siteConfig.ctas.getQuote.href}
                className="btn-outline !py-2 !px-4 !text-sm hidden xl:inline-flex"
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {siteConfig.ctas.getQuote.label}
              </Link>

              <button
                type="button"
                onClick={() => openModal()}
                className="btn-primary !py-2 !px-4 !text-sm"
              >
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {siteConfig.ctas.bookService.label}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center rounded-lg p-2 text-navy-800 hover:bg-neutral-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={siteConfig.nav}
        config={siteConfig.ctas}
        phone={company.phone}
        onBookService={() => openModal()}
      />
    </>
  )
}
export default Header
