'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    __revealReady?: boolean
  }
}

/**
 * Inline <head> script: <html> par "js" class lagata hai taaki [data-reveal] elements
 * scroll tak chhupe rahein. Agar 3 second mein observer start nahi hua (script fail),
 * class hata di jaati hai aur saara content dikh jaata hai — content kabhi phansa nahi rehta.
 */
export const REVEAL_BOOT_SCRIPT =
  "(function(){var d=document.documentElement;if(!('IntersectionObserver' in window))return;d.classList.add('js');setTimeout(function(){if(!window.__revealReady)d.classList.remove('js')},3000)})();"

/** One shared IntersectionObserver for every [data-reveal] element on the page. */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    window.__revealReady = true
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', '')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 }
    )
    const scan = (root: ParentNode) => root.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => io.observe(el))
    scan(document)
    // Naye page (client navigation) ya baad mein aaye content ke liye bhi.
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n instanceof Element) {
            if (n.matches('[data-reveal]:not([data-revealed])')) io.observe(n)
            scan(n)
          }
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
