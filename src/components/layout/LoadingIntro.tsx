'use client'

import { useEffect, useState } from 'react'

const FRAMES = ['/images/hero/intro-1.jpg', '/images/hero/intro-2.jpg', '/images/hero/intro-3.jpg', '/images/hero/intro-4.jpg']

/** Inline in <head>: skips the animation for visitors who already saw it in this tab. */
export const LOADING_INTRO_BOOT_SCRIPT = "try{if(sessionStorage.getItem('pipeflow-intro-seen'))document.documentElement.classList.add('no-intro')}catch(e){}"

/**
 * Full-screen loading animation (pipe, runner, logo, tagline). Pure CSS, so it plays from the first paint
 * without waiting for JavaScript, lasts about two seconds, then fades away and stops blocking clicks.
 */
export function LoadingIntro() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    try {
      sessionStorage.setItem('pipeflow-intro-seen', '1')
    } catch {}
    // Safety net: remove the overlay from the page even if the CSS fade never finishes.
    const t = setTimeout(() => setDone(true), 2300)
    return () => clearTimeout(t)
  }, [])
  if (done) return null
  return (
    <div className="site-intro" aria-hidden="true">
      {FRAMES.map((src, i) => (
        <div key={src} className="site-intro-frame" style={{ animationDelay: `${i * 0.35}s` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className={`site-intro-img site-intro-img-${i}`} width={400} height={360} decoding="async" />
        </div>
      ))}
    </div>
  )
}
