'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Menu, Phone } from 'lucide-react'
import { Navigation } from './Navigation'
import { MobileNavigation } from './MobileNavigation'
import { AnnouncementBar } from './AnnouncementBar'
import { hasRealPhone } from '@/lib/config/contact'
import { siteConfig } from '@/lib/config/site'
import { useNavigation } from './NavigationProvider'
import { cn } from '@/lib/cn'
import { useSiteSettings } from './SiteSettingsProvider'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const { company, announcementMessages } = useSiteSettings()
  const nav = useNavigation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMobileMenuOpen(false)
    // Menu band hone par keyboard focus wapas menu button par, taaki user page mein kho na jaye.
    if (restoreFocus) menuButton.current?.focus()
  }, [])

  return (
    <>
      {announcementMessages.length > 0 && <AnnouncementBar messages={announcementMessages} />}
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-[background-color,box-shadow] duration-300',
          isScrolled ? 'bg-white/90 shadow-[0_1px_0_rgba(11,23,40,0.06),0_12px_30px_-20px_rgba(11,23,40,0.45)] backdrop-blur-md' : 'bg-white'
        )}
        role="banner"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>

        <div className="container-wide">
          <div className={cn('flex items-center justify-between gap-4 transition-[height] duration-300 ease-out-expo', isScrolled ? 'h-16' : 'h-[72px] lg:h-20')}>
            <Link href="/" aria-label={`${siteConfig.company.name} — Home`} className="group flex-shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
              <Image
                src="/assets/logo.png"
                alt=""
                width={1024}
                height={426}
                sizes="170px"
                className={cn(
                  'h-auto animate-logo-in object-contain transition-[width,transform] duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:-rotate-1',
                  isScrolled ? 'w-[118px] lg:w-[132px]' : 'w-[124px] sm:w-[140px] lg:w-[160px]'
                )}
                priority
              />
            </Link>

            <Navigation items={nav.header} className="hidden flex-1 justify-center lg:flex" />

            <div className="hidden flex-shrink-0 items-center gap-3 lg:flex">
              {hasRealPhone(company.phone) && (
                <a href={`tel:${company.phone}`} className="group inline-flex items-center gap-2 px-2 text-sm font-semibold text-ink" aria-label={`Call ${company.phone}`}>
                  <Phone className="h-4 w-4 text-brand-red" aria-hidden="true" />
                  <span className="link-grow hidden xl:inline">{company.phone}</span>
                  <span className="xl:hidden">Call</span>
                </a>
              )}
              <Link href={nav.cta.href} className="cta cta-solid !min-h-[2.75rem] !px-5 !py-2.5 !text-sm">
                {nav.cta.label}
                <ArrowRight className="cta-arrow" aria-hidden="true" />
              </Link>
            </div>

            <button
              ref={menuButton}
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={closeMenu}
        items={nav.header}
        config={{ ...siteConfig.ctas, bookService: nav.cta }}
        phone={company.phone}
      />
    </>
  )
}
export default Header
