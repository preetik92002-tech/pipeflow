'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { MenuItem } from '@/lib/cms-pages/menu'

interface NavigationProps {
  items: NavItem[]
  className?: string
  /** 'bar' = white bold uppercase links on the blue nav bar, with dividers. */
  variant?: 'plain' | 'bar'
}

/** Active page: neeche laal line poori; baaki links par hover karne se line baayein se badhti hai. */
export function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
}

export function Navigation({ items, className, variant = 'plain' }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className={cn('flex items-center', variant === 'bar' ? 'w-full justify-center' : 'gap-1 xl:gap-2', className)}>
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'whitespace-nowrap transition-colors duration-200',
              variant === 'bar'
                ? cn('flex-1 border-l border-white/20 px-3 py-3.5 text-center text-[0.82rem] font-bold uppercase tracking-wide first:border-l-0 hover:bg-white/15 xl:text-sm', isActive ? 'bg-white/20 text-white' : 'text-white')
                : cn('px-2.5 py-2 text-[0.92rem] font-medium xl:px-3', isActive ? 'text-ink' : 'text-neutral-600 hover:text-ink')
            )}
          >
            <span className={cn('link-grow', variant === 'bar' ? 'after:!bg-white' : 'after:!bg-terra')} data-active={isActive ? '' : undefined}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
export default Navigation
