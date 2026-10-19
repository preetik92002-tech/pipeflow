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
    <footer className="relative isolate overflow-hidden bg-ink text-white" role="contentinfo">
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[32rem] w-[32rem] bg-terra/15 blur-3xl" aria-hidden="true" />

      {/* Har page ka apna CTA section upar hota hai, isliye footer mein dobara CTA nahi (duplicate lagta tha). */}
      <div className="container-wide grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="sm:col-span-2 lg:col-span-4">
          <Link href="/" aria-label={`${company.name} — Home`} className="inline-block bg-white px-4 py-3 transition-transform duration-300 hover:-translate-y-0.5">
            <Image src="/assets/logo.png" alt="" width={1024} height={426} sizes="180px" className="h-auto w-[170px]" />
          </Link>
          <p className="mt-6 max-w-sm leading-relaxed text-white/65">{company.tagline} Request plumbing and HVAC service from local professionals serving Denver and Boulder.</p>
          <ul className="mt-6 space-y-3 text-[0.95rem] text-white/80">
            {hasRealPhone(company.phone) && (
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-terra-light" aria-hidden="true" />
                <a href={`tel:${company.phone}`} className="link-grow">
                  {company.phone}
                </a>
              </li>
            )}
            {company.email && (
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-terra-light" aria-hidden="true" />
                <a href={`mailto:${company.email}`} className="link-grow">
                  {company.email}
                </a>
              </li>
            )}
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-terra-light" aria-hidden="true" />
              <span>Serving Denver &amp; Boulder, {company.state}</span>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          <Column title="Services" links={nav.footerServices} />
        </div>
        <div className="lg:col-span-2">
          <Column title="Locations" links={nav.footerAreas} />
        </div>
        <div className="lg:col-span-2">
          <Column title="Company" links={nav.footerCompany} />
        </div>
        <div className="lg:col-span-2">
          <Column title="Resources" links={nav.footerResources} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col items-center justify-between gap-4 py-6 text-sm text-white/50 sm:flex-row">
          <p>
            &copy; {year} {company.name} All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${company.name} on Facebook`}
                className="p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${company.name} on Instagram`}
                className="p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {social.google && (
              <a
                href={social.google}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${company.name} on Google`}
                className="p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Star className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
