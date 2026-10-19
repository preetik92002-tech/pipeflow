'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Long card text stays fully readable on wide screens and starts collapsed on phones, where a tall stack of
 * long cards is the main cause of endless scrolling. It renders open (all text present, no script needed);
 * after load it collapses on narrow screens only. Keyboard and screen readers get a real disclosure control.
 */
export function ExpandOnDesktop({ summary = 'Read details', children }: { summary?: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      if (ref.current) ref.current.open = query.matches
    }
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return (
    <details ref={ref} open className="group flex-1">
      <summary className="flex min-h-[2.75rem] cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-terra lg:hidden [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">{summary}</span>
        <span className="hidden group-open:inline">Hide details</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      {children}
    </details>
  )
}
