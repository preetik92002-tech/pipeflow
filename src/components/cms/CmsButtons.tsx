import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CmsButton } from '@/lib/cms-pages/links'
import { isExternalHref } from '@/lib/cms-pages/links'

/** An internal path uses next/link (client navigation); anything else is a normal link. */
export function SmartLink({ href, className, children, ...rest }: { href: string; className?: string; children: React.ReactNode; 'aria-label'?: string }) {
  if (href.startsWith('/')) return <Link href={href} className={className} {...rest}>{children}</Link>
  return (
    <a href={href} className={className} {...rest} {...(isExternalHref(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  )
}

/**
 * CMS buttons. Primary = laal solid pill; secondary = outline (dark background par white).
 * `asLinks` unhe arrow wale text links bana deta hai, jahan kai chhote blocks ek row mein hon.
 */
export function CmsButtons({ buttons, onDark = false, center = false, asLinks = false, className = 'mt-9' }: { buttons: CmsButton[]; onDark?: boolean; center?: boolean; asLinks?: boolean; className?: string }) {
  if (!buttons.length) return null
  if (asLinks) {
    return (
      <div className={`${className} flex flex-wrap gap-x-6 gap-y-3`}>
        {buttons.map((b, i) => (
          <SmartLink key={i} href={b.href} className={`group inline-flex items-center gap-2 font-semibold ${onDark ? 'text-white' : 'text-ink'}`}>
            <span className="link-grow">{b.label}</span>
            <ArrowRight className="cta-arrow text-brand-red" aria-hidden="true" />
          </SmartLink>
        ))}
      </div>
    )
  }
  return (
    <div className={`${className} flex flex-col gap-3 sm:flex-row sm:flex-wrap ${center ? 'sm:justify-center' : ''}`}>
      {buttons.map((b, i) => {
        const primary = b.variant !== 'secondary'
        const cls = `cta ${primary ? 'cta-solid' : onDark ? 'cta-on-dark' : 'cta-line'}`
        return (
          <SmartLink key={i} href={b.href} className={cls}>
            {b.label}
            {primary && <ArrowRight className="cta-arrow" aria-hidden="true" />}
          </SmartLink>
        )
      })}
    </div>
  )
}
