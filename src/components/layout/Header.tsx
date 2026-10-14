'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, Phone } from 'lucide-react'
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
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>

        <div className="container-wide">
          <div className={cn('flex items-center justify-between gap-4 transition-[height] duration-300 ease-out-expo', isScrolled ? 'h-14' : 'h-16 lg:h-[84px]')}>
            <Link href="/" aria-label={`${siteConfig.company.name} — Home`} className="group flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terra">
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

            <p className="hidden flex-1 flex-col items-center leading-none lg:flex">
              <span className="bg-gradient-to-r from-brand-blue via-navy-800 to-brand-red bg-clip-text font-display text-2xl font-black italic tracking-tight text-transparent xl:text-[1.9rem]">
                Plumbing &amp; HVAC Pros
              </span>
              <span className="mt-1.5 flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy-800 xl:text-xs">
                <span className="h-0.5 w-6 rounded-full bg-brand-red" aria-hidden="true" />
                Serving Denver &amp; Boulder
                <span className="h-0.5 w-6 rounded-full bg-brand-red" aria-hidden="true" />
              </span>
            </p>
            <span className="flex-1 lg:hidden" aria-hidden="true" />

            <div className="hidden flex-shrink-0 items-center gap-3 lg:flex">
              {hasRealPhone(company.phone) && (
                <a href={`tel:${company.phone}`} className="group inline-flex items-center gap-2 px-2 text-sm font-semibold text-ink" aria-label={`Call ${company.phone}`}>
                  <Phone className="h-4 w-4 text-terra" aria-hidden="true" />
                  <span className="link-grow hidden xl:inline">{company.phone}</span>
                  <span className="xl:hidden">Call</span>
                </a>
              )}
              <Link href={nav.cta.href} className="btn-primary !px-5 !py-2.5">
                {nav.cta.label}
              </Link>
            </div>

            <button
              ref={menuButton}
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-navy-800 text-white shadow-md transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        {/* Phones and tablets: slim blue tagline strip instead of the desktop nav bar. */}
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-navy-800 via-brand-blue to-navy-800 px-4 py-1.5 text-center text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white sm:text-xs lg:hidden">
          <span className="h-0.5 w-4 rounded-full bg-brand-red" aria-hidden="true" />
          Plumbing &amp; HVAC Pros · Serving Denver &amp; Boulder
          <span className="h-0.5 w-4 rounded-full bg-brand-red" aria-hidden="true" />
        </div>
        <div className="hidden bg-gradient-to-b from-brand-blue to-navy-700 shadow-md lg:block">
          <div className="container-wide">
            <Navigation items={nav.header} variant="bar" />
          </div>
        </div>
        <div className="h-[3px] w-full bg-gradient-to-r from-brand-blue via-navy-700 to-brand-red" aria-hidden="true" />
      </header>

      <MobileNavigation isOpen={mobileMenuOpen} onClose={closeMenu} items={nav.header} config={{ ...siteConfig.ctas, bookService: nav.cta }} phone={company.phone} />
    </>
  )
}
export default Header
