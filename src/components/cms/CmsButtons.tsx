import Link from 'next/link'
import type { CmsButton } from '@/lib/cms-pages/links'
import { isExternalHref } from '@/lib/cms-pages/links'

export function CmsButtons({ buttons, onDark = false, center = false }: { buttons: CmsButton[]; onDark?: boolean; center?: boolean }) {
  if (!buttons.length) return null
  return (
    <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${center ? 'sm:justify-center' : ''}`}>
      {buttons.map((b, i) => {
        const cls =
          b.variant === 'secondary'
            ? onDark
              ? 'inline-flex items-center justify-center rounded-lg border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-navy-800 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900'
              : 'btn-outline !px-6 !py-3'
            : 'btn-primary !px-6 !py-3'
        return b.href.startsWith('/') ? (
          <Link key={i} href={b.href} className={cls}>
            {b.label}
          </Link>
        ) : (
          <a key={i} href={b.href} className={cls} {...(isExternalHref(b.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {b.label}
          </a>
        )
      })}
    </div>
  )
}
