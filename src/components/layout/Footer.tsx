'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Phone,
  Mail,
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
  Flame,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

const serviceLinks = [
  { label: 'Leak Repair & Detection', href: '/services/plumbing/leak-repair' },
  { label: 'Drain Cleaning & Jetting', href: '/services/plumbing/drain-cleaning' },
  { label: 'Water Heater Repair & Install', href: '/services/plumbing/water-heater' },
  { label: 'Pipe Repair & Repiping', href: '/services/plumbing/pipe-repair' },
  { label: 'Furnace & Heating Repair', href: '/services/hvac/furnace-heating' },
  { label: 'Heat Pumps & Dual Fuel', href: '/services/hvac/heat-pumps' },
  { label: 'Air Conditioning Service', href: '/services/hvac/ac-installation' },
]

const serviceAreaLinks = [
  { label: 'Denver (Primary Hub)', href: '/service-areas/denver' },
  { label: 'Aurora', href: '/service-areas/aurora' },
  { label: 'Lakewood', href: '/service-areas/lakewood' },
  { label: 'Englewood & Littleton', href: '/service-areas/englewood' },
  { label: 'Arvada & Westminster', href: '/service-areas/arvada' },
  { label: 'Thornton & Centennial', href: '/service-areas/centennial' },
  { label: 'All 12 Service Territories →', href: '/service-areas' },
]

const companyLinks = [
  { label: 'About PipeFlow', href: '/about' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'The PipeFlow Standard', href: '/#trust-heading' },
  { label: 'Join as a Pro Contractor', href: '/join-us' },
  { label: 'Careers & Recruitment', href: '/join-us' },
  { label: 'Customer Reviews', href: '/#reviews' },
]

const resourceLinks = [
  { label: 'PipeFlow Journal & Blog', href: '/blog' },
  { label: 'Winter Frozen Pipe Guide', href: '/blog/prevent-frozen-pipes-colorado-winter' },
  { label: 'Heat Pumps vs Furnaces', href: '/blog/heat-pumps-vs-furnaces-colorado-climate' },
  { label: 'Water Heater Failure Signs', href: '/blog/warning-signs-water-heater-failure' },
  { label: '24/7 Emergency Dispatch', href: '/contact' },
]

export function Footer() {
  const year = new Date().getFullYear()
  const { company, social } = siteConfig

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
                PLUMBING &bull; HVAC &bull; COLORADO
              </p>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mt-2">
                Reliable service for homes that work better.
              </h3>
              <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-xl mx-auto">
                Denver Front Range licensed residential plumbing, heating, and cooling specialists.
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

              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-white hover:text-brand-blue-lighter transition-colors"
                aria-label={`Call PipeFlow directly at ${company.phone}`}
              >
                <Phone className="h-5 w-5 text-brand-red flex-shrink-0" />
                <span>Call: {company.phone}</span>
              </a>
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

          {/* Column 5: Contact & Dispatch Headquarters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-navy-800 pb-2 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-brand-blue" />
              <span>Contact &amp; Dispatch</span>
            </h4>
            <div className="space-y-3 text-neutral-300">
              <div>
                <span className="text-2xs uppercase tracking-wider text-neutral-500 block">24/7 Phone Line</span>
                <a
                  href={`tel:${company.phone}`}
                  className="font-bold text-white hover:text-brand-blue-lighter transition-colors text-sm"
                >
                  {company.phone}
                </a>
              </div>

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
                <span className="text-2xs uppercase tracking-wider text-neutral-500 block">Headquarters</span>
                <p className="text-neutral-400">
                  {company.city}, {company.state} {company.zip}
                </p>
                <p className="text-2xs text-neutral-500 font-mono mt-0.5">{company.license}</p>
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
            &copy; {year} PipeFlow Co. All Rights Reserved. Licensed Denver Master Plumbing &amp; HVAC Mechanical Services.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-neutral-300 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
