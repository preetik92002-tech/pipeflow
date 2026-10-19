'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Mail, MapPin, Phone, Star } from 'lucide-react'
import { hasRealPhone } from '@/lib/config/contact'
import { siteConfig } from '@/lib/config/site'
import { footerColumns } from '@/lib/cms-pages/menu'
import { useSiteSettings } from './SiteSettingsProvider'
import { useNavigation } from './NavigationProvider'
import type { NavLink } from '@/lib/cms-pages/navigation-schema'

const PLACEHOLDER_EMAIL = 'hello@pipeflowco.com'

function Column({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{title}</h2>
      <ul className="mt-3 space-y-1">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link href={link.href} className="inline-flex min-h-[2rem] items-center text-[0.92rem] text-white/80 transition-colors hover:text-white hover:underline hover:underline-offset-4">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Footer. Sirf confirm ki hui jaankari: phone tabhi jab Settings mein asli number ho, aur koi
 *"24/7" ya response-time ka daawa nahi (business ne confirm nahi kiya). Links come from Admin > Navigation, grouped by topic.
 */
export function Footer() {
  const year = new Date().getFullYear()
  const nav = useNavigation()
  const { company: staticCompany, social } = siteConfig
  const { company: liveCompany } = useSiteSettings()
  const company = { ...staticCompany, ...liveCompany }
  const columns = footerColumns(nav)
  const socials = [
    { href: social.facebook, label: 'Facebook', Icon: Facebook },
    { href: social.instagram, label: 'Instagram', Icon: Instagram },
    { href: social.google, label: 'Google', Icon: Star },
  ].filter((s) => s.href)

  return (
    <footer className="bg-ink pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-white lg:pb-0" role="contentinfo">
      <div className="container-wide grid gap-x-8 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:py-14">
        <div className="sm:col-span-2 lg:col-span-4">
          <Link href="/" aria-label={`${company.name} — Home`} className="inline-block rounded-lg bg-white px-3 py-2">
            <Image src="/assets/logo.png" alt="" width={1024} height={426} sizes="140px" className="h-auto w-[128px]" />
          </Link>
          <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-white/70">
            {company.name} helps customers explore plumbing and HVAC services in Denver, Boulder and nearby communities, and send a service request.
          </p>
          <ul className="mt-5 space-y-2 text-[0.92rem] text-white/80">
            {hasRealPhone(company.phone) && (
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-terra-light" aria-hidden="true" />
                <a href={`tel:${company.phone}`} className="hover:underline">
                  {company.phone}
                </a>
              </li>
            )}
            {/* The default address in src/lib/config/site.ts is marked as a placeholder: only a confirmed address is shown. */}
            {company.email && company.email !== PLACEHOLDER_EMAIL && (
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-terra-light" aria-hidden="true" />
                <a href={`mailto:${company.email}`} className="hover:underline">
                  {company.email}
                </a>
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-terra-light" aria-hidden="true" />
              <span>Service areas: Denver &amp; Boulder, {company.state}</span>
            </li>
          </ul>
        </div>
        <div className={`grid grid-cols-2 gap-x-6 gap-y-8 sm:col-span-2 md:grid-cols-3 lg:col-span-8 ${columns.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          {columns.map((c) => (
            <Column key={c.title} title={c.title} links={c.links} />
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-3 py-5 text-[0.8rem] text-white/55 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl leading-relaxed">
            &copy; {year} {company.name.replace(/\.$/, '')}. Service availability, pricing, scheduling and terms vary by location, service type and provider. A website request is not an emergency line: for gas, carbon monoxide or flooding hazards, call 911 or your utility.
          </p>
          {socials.length > 0 && (
            <div className="flex items-center gap-1">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${company.name} on ${label}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
