'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, Phone } from 'lucide-react'
import { Navigation } from './Navigation'
import { MobileNavigation } from './MobileNavigation'
import { AnnouncementBar } from './AnnouncementBar'
import { ThemeToggle } from './ThemeToggle'
import { hasRealPhone } from '@/lib/config/contact'
import { siteConfig } from '@/lib/config/site'
import { buildMenu } from '@/lib/cms-pages/menu'
import { useNavigation } from './NavigationProvider'
import { cn } from '@/lib/cn'
import { useSiteSettings } from './SiteSettingsProvider'

/**
 * One compact bar: logo, main menu (lg and up) and the customer action. The contractor link sits apart from
 * Request Service and is styled as a plain text link, so the two journeys never look like the same action.
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const { company, announcementMessages } = useSiteSettings()
  const nav = useNavigation()
  const menu = useMemo(() => buildMenu(nav), [nav])
  const mobileMenu = useMemo(() => buildMenu(nav, { includeHome: true }), [nav])
  // The contractor journey, taken from the admin-managed footer links (never invented here).
  const contractors = [...nav.footerCompany, ...nav.footerResources].find((l) => l.href === '/for-contractors')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
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
        className={cn('sticky top-0 z-40 w-full border-b bg-white transition-[box-shadow,border-color] duration-200', isScrolled ? 'border-line shadow-nav' : 'border-transparent')}
        role="banner"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>

        <div className="container-wide flex h-16 items-center gap-4 lg:h-[72px]">
          <Link href="/" aria-label={`${siteConfig.company.name} — Home`} className="flex-shrink-0 rounded-lg">
            <Image src="/assets/logo.png" alt="" width={1024} height={426} sizes="150px" className="h-auto w-[112px] sm:w-[124px] lg:w-[136px]" priority />
          </Link>

          <Navigation items={menu} className="mx-auto hidden lg:block" />
          <span className="flex-1 lg:hidden" aria-hidden="true" />

          <ThemeToggle className="flex-shrink-0" />

          <div className="hidden flex-shrink-0 items-center gap-4 lg:flex">
            {contractors && (
              <Link href={contractors.href} className="hidden text-sm font-semibold text-neutral-600 hover:text-ink dark:hover:text-[#EAF1FB] xl:inline">
                For Contractors
              </Link>
            )}
            {hasRealPhone(company.phone) && (
              <a href={`tel:${company.phone}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink" aria-label={`Call ${company.phone}`}>
                <Phone className="h-4 w-4 text-terra" aria-hidden="true" />
                <span className="hidden xl:inline">{company.phone}</span>
              </a>
            )}
            <Link href={nav.cta.href} className="ui-btn ui-btn-primary ui-btn-sm">
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
            className="-mr-1 flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-paper dark:hover:bg-[#132952] lg:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileNavigation isOpen={mobileMenuOpen} onClose={closeMenu} items={mobileMenu} cta={nav.cta} contractors={contractors} joinPro={siteConfig.ctas.joinPro} phone={company.phone} />
    </>
  )
}
export default Header
