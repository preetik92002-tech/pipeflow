'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * GSAP chunk hydration ke baad, browser ke khali hone par (idle) load aur shuru hota hai, taaki React hydration aur LCP se
 * main thread ki race na ho (pehle ye ~1.8s CPU hydration ke saath hi kha raha tha). Idle ka intezaar max 500ms hai,
 * isliye heading-reveal mein dikhne laayak deri nahi aati. Har route change par purani animations revert hoti hain aur
 * naye page ke DOM par dobara bandhti hain, isliye ScrollTriggers kabhi jama nahi hote. Load fail ho to "js" class hat
 * jaati hai aur content jaisa HTML mein hai waisa dikhta hai.
 */
export function MotionRoot() {
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined
    const start = () => {
      import('./init-motion')
        .then(({ initMotion }) => {
          if (!cancelled) cleanup = initMotion()
        })
        .catch(() => document.documentElement.classList.remove('js'))
    }
    // Safari ke purane versions mein requestIdleCallback nahi hota: tab chhota setTimeout.
    const hasIdle = 'requestIdleCallback' in window
    const handle = hasIdle ? window.requestIdleCallback(start, { timeout: 500 }) : window.setTimeout(start, 120)
    return () => {
      cancelled = true
      if (hasIdle) window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
      cleanup?.()
    }
  }, [pathname])

  return null
}
