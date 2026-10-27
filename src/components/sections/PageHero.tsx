import React from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
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
  const cls = primary ? 'ui-btn ui-btn-primary flex-1 sm:flex-none' : 'ui-btn ui-btn-on-dark flex-1 sm:flex-none'
  const inner = (
    <>
      {cta.label}
    </>
  )
  return cta.isExternal || cta.href.startsWith('tel:') ? (
    <a href={cta.href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={cta.href} className={cls}>
      {inner}
    </Link>
  )
}

/** Listing pages (blog) ka hero: poori chaudai ki photo, bayein taraf text, neeche gehra overlay. */
export function PageHero({ imageSrc, imageAlt, eyebrow, title, description, primaryCta, secondaryCta, className = '', priority = true }: PageHeroProps) {
  return (
    <section className={`relative isolate flex min-h-[min(52svh,440px)] items-end overflow-hidden bg-ink text-white sm:min-h-[min(60svh,520px)] ${className}`} aria-label={title}>
      <div className="absolute inset-0 -z-20 hero-photo-settle">
        <CmsImage src={imageSrc} alt={imageAlt} priority={priority} sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/25" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" aria-hidden="true" />
      <div className="container-wide w-full pb-10 pt-20 sm:pb-16 sm:pt-28">
        <div className="hero-enter max-w-3xl">
          {eyebrow && <p className="ui-kicker !text-terra-light">{eyebrow}</p>}
          <h1 className="mt-3 font-display text-display-xl font-semibold">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lead">{description}</p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-7 flex gap-3 sm:flex-wrap">
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
