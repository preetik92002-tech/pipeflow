import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

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

export function PageHero({
  imageSrc,
  imageAlt,
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  primaryCta,
  secondaryCta,
  badgeText,
  imagePosition = 'center right',
  className,
  priority = true,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative w-full bg-navy-950 text-white overflow-hidden min-h-[480px] lg:min-h-[540px] flex items-center',
        className
      )}
      aria-label={title}
    >
      {/* Background Cinematic Image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="100vw"
          className="w-full h-full object-cover"
          style={{ objectPosition: imagePosition }}
        />

        {/* Subtle gradient to ensure flawless typography contrast on the left */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/70 to-transparent lg:via-navy-950/40"
          aria-hidden="true"
        />
        {/* Subtle vertical vignette for crisp header/bottom boundaries */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-navy-950/40"
          aria-hidden="true"
        />
      </div>

      {/* Hero Content Container - Left Aligned */}
      <div className="container-site relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl lg:max-w-xl text-left">
          {/* Eyebrow badge */}
          {(eyebrow || EyebrowIcon) && (
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/30 border border-brand-blue-light/40 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-5">
              {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />}
              {eyebrow && <span>{eyebrow}</span>}
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white tracking-tight leading-[1.15] mb-5">
            {title}
          </h1>

          {/* Supporting Paragraph */}
          <p className="text-sm sm:text-base lg:text-lg text-neutral-200 leading-relaxed mb-8">
            {description}
          </p>

          {/* Call to Actions */}
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {primaryCta && (
                primaryCta.isExternal || primaryCta.href.startsWith('tel:') ? (
                  <a
                    href={primaryCta.href}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-lg',
                      primaryCta.variant === 'red'
                        ? 'bg-brand-red hover:bg-brand-red-dark text-white shadow-brand-red/20'
                        : 'bg-brand-blue hover:bg-brand-blue-light text-white shadow-brand-blue/20'
                    )}
                  >
                    {primaryCta.icon && <primaryCta.icon className="h-4 w-4 flex-shrink-0" />}
                    <span>{primaryCta.label}</span>
                  </a>
                ) : (
                  <Link
                    href={primaryCta.href}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-lg',
                      primaryCta.variant === 'red'
                        ? 'bg-brand-red hover:bg-brand-red-dark text-white shadow-brand-red/20'
                        : 'bg-brand-blue hover:bg-brand-blue-light text-white shadow-brand-blue/20'
                    )}
                  >
                    {primaryCta.icon && <primaryCta.icon className="h-4 w-4 flex-shrink-0" />}
                    <span>{primaryCta.label}</span>
                  </Link>
                )
              )}

              {secondaryCta && (
                secondaryCta.isExternal || secondaryCta.href.startsWith('tel:') ? (
                  <a
                    href={secondaryCta.href}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md transition-all duration-200"
                  >
                    {secondaryCta.icon && <secondaryCta.icon className="h-4 w-4 flex-shrink-0" />}
                    <span>{secondaryCta.label}</span>
                  </a>
                ) : (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md transition-all duration-200"
                  >
                    {secondaryCta.icon && <secondaryCta.icon className="h-4 w-4 flex-shrink-0" />}
                    <span>{secondaryCta.label}</span>
                  </Link>
                )
              )}
            </div>
          )}

          {/* Optional Footer Badge */}
          {badgeText && (
            <div className="mt-6 flex items-center gap-2 text-2xs text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{badgeText}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default PageHero
