import React from 'react'
import Link from 'next/link'
import { ArrowRight, LucideIcon } from 'lucide-react'
import { CmsImage } from '@/components/cms/CmsImage'

export interface PageHeroCTA {
  label: string
  href: string
  variant?: 'primary' | 'outline' | 'red'
  icon?: LucideIcon
  isExternal?: boolean
}

export interface PageHeroProps {
  imageSrc: string
  imageAlt: string
  eyebrow?: string
  eyebrowIcon?: LucideIcon
  title: string
  description: string
  primaryCta?: PageHeroCTA
  secondaryCta?: PageHeroCTA
  badgeText?: string
  imagePosition?: string
  className?: string
  priority?: boolean
}

function HeroLink({ cta, primary }: { cta: PageHeroCTA; primary: boolean }) {
  const cls = `cta ${primary ? 'cta-solid' : 'cta-on-dark'}`
  const inner = (
    <>
      {cta.label}
      {primary && <ArrowRight className="cta-arrow" aria-hidden="true" />}
    </>
  )
  return cta.isExternal || cta.href.startsWith('tel:') ? <a href={cta.href} className={cls}>{inner}</a> : <Link href={cta.href} className={cls}>{inner}</Link>
}

/** Listing pages (blog) ka hero: poori chaudai ki photo, bayein taraf text, neeche gehra overlay. */
export function PageHero({ imageSrc, imageAlt, eyebrow, title, description, primaryCta, secondaryCta, className = '', priority = true }: PageHeroProps) {
  return (
    <section className={`relative isolate flex min-h-[min(70svh,620px)] items-end overflow-hidden bg-ink text-white ${className}`} aria-label={title}>
      <div className="absolute inset-0 -z-20 hero-photo-settle">
        <CmsImage src={imageSrc} alt={imageAlt} priority={priority} sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/25" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" aria-hidden="true" />
      <div className="container-wide w-full pb-14 pt-28 sm:pb-20">
        <div className="hero-enter max-w-3xl">
          {eyebrow && <p className="eyebrow eyebrow-light">{eyebrow}</p>}
          <h1 className="mt-5 font-display text-display-xl font-normal">{title}</h1>
          <p className="mt-6 max-w-2xl text-lead text-white/80">{description}</p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {primaryCta && <HeroLink cta={primaryCta} primary />}
              {secondaryCta && <HeroLink cta={secondaryCta} primary={false} />}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default PageHero
