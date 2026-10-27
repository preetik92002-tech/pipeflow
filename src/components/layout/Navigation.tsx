'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { MenuItem } from '@/lib/cms-pages/menu'

/** Active page: the item itself, or any page below it. */
export function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
}

const itemActive = (pathname: string, item: MenuItem) => isActivePath(pathname, item.href) || item.children.some((c) => isActivePath(pathname, c.href))

/**
 * One dropdown. The label stays a real link to the overview page; the chevron button opens the list (disclosure pattern).
 * Opens on hover for mouse users, on click/Enter/Space for everyone else; Escape and outside clicks close it.
 */
function Dropdown({ item, active, current, open, onOpen, onClose }: { item: MenuItem; active: boolean; current: boolean; open: boolean; onOpen: () => void; onClose: (focusButton: boolean) => void }) {
  const id = useId()
  const button = useRef<HTMLButtonElement>(null)
  const panelHasLink = item.children.some((c) => c.href === item.href)
  return (
    <li
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && onOpen()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onClose(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          onClose(true)
          button.current?.focus()
        }
      }}
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) onClose(false)
      }}
    >
      <div className={cn('flex items-center rounded-lg transition-colors', open ? 'bg-paper dark:bg-[#132952]' : 'hover:bg-paper dark:hover:bg-[#132952]')}>
        <Link href={item.href} aria-current={current ? 'page' : undefined} className={cn('whitespace-nowrap py-2 pl-2 pr-0.5 text-[0.9rem] font-semibold xl:pl-3 xl:text-[0.93rem]', active ? 'text-terra' : 'text-ink')}>
          {item.label}
        </Link>
        <button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${item.label} menu`}
          onClick={() => (open ? onClose(false) : onOpen())}
          className="flex h-9 w-6 items-center justify-center rounded-md text-ink/60 hover:text-ink dark:hover:text-[#EAF1FB] xl:w-7"
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>
      <div id={id} hidden={!open} className="absolute left-0 top-full z-50 pt-2">
        <ul className="min-w-[15rem] rounded-xl border border-line bg-white p-2 shadow-card-hover">
          {!panelHasLink && (
            <li>
              <Link href={item.href} className="block rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-paper dark:hover:bg-[#132952]">
                All {item.label}
              </Link>
            </li>
          )}
          {item.children.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-paper hover:text-ink dark:hover:bg-[#132952] dark:hover:text-[#EAF1FB]">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

/** Desktop main menu (lg and up). */
export function Navigation({ items, className }: { items: MenuItem[]; className?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState<number | null>(null)
  const root = useRef<HTMLElement>(null)

  useEffect(() => setOpen(null), [pathname])
  useEffect(() => {
    if (open === null) return
    const away = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  return (
    <nav ref={root} aria-label="Main navigation" className={className}>
      <ul className="flex items-center gap-0.5">
        {items.map((item, i) => {
          const active = itemActive(pathname, item)
          if (item.children.length === 0)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                  className={cn('block whitespace-nowrap rounded-lg px-2 py-2 text-[0.9rem] font-semibold transition-colors hover:bg-paper dark:hover:bg-[#132952] xl:px-3 xl:text-[0.93rem]', active ? 'text-terra' : 'text-ink')}
                >
                  {item.label}
                </Link>
              </li>
            )
          return <Dropdown key={item.href} item={item} active={active} current={pathname === item.href} open={open === i} onOpen={() => setOpen(i)} onClose={() => setOpen((o) => (o === i ? null : o))} />
        })}
      </ul>
    </nav>
  )
}
export default Navigation
