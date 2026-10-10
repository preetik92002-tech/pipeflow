'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Phone,
  MapPin,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  Facebook,
  Instagram,
  Star,
  ArrowRight,
  Droplets,
} from 'lucide-react'
import { hasRealPhone } from '@/lib/config/contact'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { useSiteSettings } from './SiteSettingsProvider'

const serviceLinks = [
  { label: 'Plumbing Repair', href: '/plumbing/plumbing-repair' },
  { label: 'Water Heater Repair', href: '/plumbing/water-heater-repair' },
  { label: 'Frozen Pipe Repair', href: '/plumbing/frozen-pipe-repair' },
  { label: 'AC Repair', href: '/hvac/ac-repair' },
  { label: 'AC Installation', href: '/hvac/ac-installation' },
]

const serviceAreaLinks = [
  { label: 'Denver', href: '/denver' },
  { label: 'Boulder', href: '/boulder' },
]

const companyLinks = [
  { label: 'Plumbing', href: '/plumbing' },
  { label: 'HVAC', href: '/hvac' },
  { label: 'For Contractors', href: '/join-us' },
  { label: 'Contact', href: '/contact' },
]

const resourceLinks = [
  { label: 'Blog', href: '/blog' },
  { label: 'Request Service', href: '/book-service' },
]

export function Footer() {
  const year = new Date().getFullYear()
  const { company: staticCompany, social } = siteConfig
  const { company: liveCompany, emergencyAvailable } = useSiteSettings()
  const company = { ...staticCompany, ...liveCompany }

  return (
    <footer
      className="bg-[#070E18] text-white border-t border-navy-800 relative overflow-hidden"
      role="contentinfo"
    >
      {/* Background Subtle Technical Pipe & Grid Accents */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#3B82D4 1px, transparent 1px), radial-gradient(#DC2626 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
        aria-hidden="true"
      />

      {/* ---------------------------------------------------- */}
      {/* 1. LARGE PROMINENT FOOTER BRAND MARQUEE & CTA AREA   */}
      {/* ---------------------------------------------------- */}
      <div className="border-b border-navy-800/80 bg-gradient-to-b from-[#0B1728] to-[#070E18]">
        <div className="container-site py-16 lg:py-20">
          <ScrollReveal direction="up" distance={24} className="text-center max-w-4xl mx-auto space-y-6">
            {/* Large PipeFlow Logo (240px–380px) */}
            <div className="flex justify-center">
              <Link href="/" aria-label="PipeFlow Co. — Home" className="inline-block group">
                <Image
                  src="/assets/logo.png"
                  alt="PipeFlow Co. Plumbing & HVAC Services"
                  width={380}
                  height={130}
                  className="w-[200px] sm:w-[280px] lg:w-[350px] h-auto object-contain brightness-110 group-hover:scale-[1.02] transition-transform duration-300"
                  priority
                />
              </Link>
            </div>

            {/* Brand Statement */}
            <div>
              <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-brand-blue-lighter">
                PLUMBING &bull; HVAC &bull; DENVER &amp; BOULDER
              </p>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mt-2">
                Flowing Comfort. Built to Last.
              </h3>
              <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-xl mx-auto">
                Plumbing and HVAC help for homes in Denver and Boulder.
              </p>
            </div>

            {/* Prominent Footer CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href={siteConfig.ctas.bookService.href}
                className="btn-primary w-full sm:w-auto !py-4 !px-8 !text-base shadow-xl shadow-brand-red/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                <span>{siteConfig.ctas.bookService.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={siteConfig.ctas.getQuote.href}
                className="btn-outline w-full sm:w-auto !text-white !border-white/20 hover:!border-white hover:!bg-white/10 !py-4 !px-8 !text-base backdrop-blur-sm hover:-translate-y-0.5 transition-all text-center"
              >
                <span>{siteConfig.ctas.getQuote.label}</span>
              </Link>

              {hasRealPhone(company.phone) && (
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-white hover:text-brand-blue-lighter transition-colors"
                aria-label={`Call PipeFlow directly at ${company.phone}`}
              >
                <Phone className="h-5 w-5 text-brand-red flex-shrink-0" />
                <span>Call: {company.phone}</span>
              </a>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. MULTI-COLUMN STRUCTURED NAVIGATION & DIRECTORY    */}
      {/* ---------------------------------------------------- */}
      <div className="container-site py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 text-xs">

          {/* Column 1: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-navy-800 pb-2 flex items-center gap-2">
              <Droplets className="h-3.5 w-3.5 text-brand-blue" />
              <span>Services</span>
            </h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors block leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Service Areas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-navy-800 pb-2 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-brand-blue" />
              <span>Service Areas</span>
            </h4>
            <ul className="space-y-2.5">
              {serviceAreaLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors block leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-navy-800 pb-2 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" />
              <span>Company</span>
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors block leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-navy-800 pb-2 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-brand-blue" />
              <span>Resources</span>
            </h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors block leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & Dispatch Service Area */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-navy-800 pb-2 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-brand-blue" />
              <span>Contact &amp; Dispatch</span>
            </h4>
            <div className="space-y-3 text-neutral-300">
              {hasRealPhone(company.phone) && (
              <div>
                <span className="text-2xs uppercase tracking-wider text-neutral-500 block">{emergencyAvailable ? '24/7 Phone Line' : 'Phone Line'}</span>
                <a
                  href={`tel:${company.phone}`}
                  className="font-bold text-white hover:text-brand-blue-lighter transition-colors text-sm"
                >
                  {company.phone}
                </a>
              </div>
              )}

              <div>
                <span className="text-2xs uppercase tracking-wider text-neutral-500 block">Email Inquiries</span>
                <a
                  href={`mailto:${company.email}`}
                  className="font-mono text-neutral-300 hover:text-white transition-colors"
                >
                  {company.email}
                </a>
              </div>

              <div>
                <span className="text-2xs uppercase tracking-wider text-neutral-500 block">Service Area</span>
                <p className="text-neutral-400">
                  Denver &amp; Boulder, {company.state}
                </p>
              </div>

              {/* Social Channels */}
              <div className="flex items-center gap-2 pt-2">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PipeFlow on Facebook"
                    className="p-2 rounded-lg bg-navy-800 text-neutral-400 hover:bg-navy-700 hover:text-white transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PipeFlow on Instagram"
                    className="p-2 rounded-lg bg-navy-800 text-neutral-400 hover:bg-navy-700 hover:text-white transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {social.google && (
                  <a
                    href={social.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="PipeFlow on Google"
                    className="p-2 rounded-lg bg-navy-800 text-neutral-400 hover:bg-navy-700 hover:text-white transition-colors"
                  >
                    <Star className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. SEPARATE DARK COPYRIGHT & LEGAL BAR               */}
      {/* ---------------------------------------------------- */}
      <div className="border-t border-navy-900 bg-[#050A12] py-6">
        <div className="container-site flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-neutral-500">
          <p>
            &copy; {year} PipeFlow Co. All Rights Reserved. 
          </p>

        </div>
      </div>
    </footer>
  )
}

export default Footer
