'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import type { NavItem } from '@/types'

interface NavigationProps {
  items: NavItem[]
  className?: string
}

/** Active page: neeche laal line poori; baaki links par hover karne se line baayein se badhti hai. */
export function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
}

export function Navigation({ items, className }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className={cn('flex items-center gap-1 xl:gap-2', className)}>
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn('whitespace-nowrap  px-2.5 py-2 text-[0.92rem] font-medium transition-colors duration-200 xl:px-3', isActive ? 'text-ink' : 'text-neutral-600 hover:text-ink')}
          >
            <span className="link-grow after:!bg-terra" data-active={isActive ? '' : undefined}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
export default Navigation
