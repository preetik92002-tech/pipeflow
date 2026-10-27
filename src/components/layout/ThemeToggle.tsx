'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const KEY = 'pf-theme'

/**
 * Inline <head> script, runs before first paint: applies a saved choice, or the OS preference when the visitor
 * has never chosen, so the page never flashes the wrong theme. `suppressHydrationWarning` on <html> (layout.tsx)
 * lets this safely run before React hydrates.
 */
export const THEME_BOOT_SCRIPT =
  "(function(){try{var s=localStorage.getItem('" +
  KEY +
  "');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})();"

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  try {
    localStorage.setItem(KEY, dark ? 'dark' : 'light')
  } catch {}
}

/**
 * Light/dark toggle for the whole public site. One click flips `dark` on <html>, which every public page's
 * dark-mode styling (globals.css) responds to; the choice is remembered for the next visit. `dark` starts as
 * `null` (unknown) until mounted, so the server-rendered button never contradicts the boot script's choice.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  return (
    <button
      type="button"
      onClick={() => {
        const next = !dark
        apply(next)
        setDark(next)
      }}
      aria-pressed={dark ?? false}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg text-ink hover:bg-paper ${className}`}
    >
      {/* Until mounted, show the sun (light is the no-JS default): never block rendering on the theme being known. */}
      {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  )
}
export default ThemeToggle
