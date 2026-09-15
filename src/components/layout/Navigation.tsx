'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import type { NavItem } from '@/types'

interface NavigationProps {
  items: NavItem[]
  className?: string
}

export function Navigation({ items, className }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className={cn('flex items-center gap-0.5', className)}>
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap',
              isActive
                ? 'bg-blue-50 text-brand-blue font-semibold'
                : 'text-neutral-600 hover:text-navy-800 hover:bg-neutral-50'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
export default Navigation
