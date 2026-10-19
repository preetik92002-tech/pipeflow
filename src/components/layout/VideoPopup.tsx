'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Maximize2, Play, Volume2, VolumeX, X } from 'lucide-react'

const VIDEO_SRC = '/assets/add.mp4'
// Kept in memory only: closing the player hides it while the visitor browses; it comes back on the next page load.
let closedThisLoad = false

/**
 * The promotional video, as a small floating player that appears on its own once the page has loaded.
 * It starts muted (browsers block audible autoplay) with a play/pause tap target over the video, plus mute,
 * full screen and close. Closing hides it for the rest of this visit. It steps aside while a request form is
 * on screen, does not appear on the request page itself, and sits above the mobile Request Service bar.
 * The video is only mounted after the page has finished loading, so it never competes with the first paint.
 */
export function VideoPopup() {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [closed, setClosed] = useState(closedThisLoad)
  const [overForm, setOverForm] = useState(false)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [dockTop, setDockTop] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const onRequestPage = pathname.startsWith('/book-service')

  // Appear automatically, but only after the page's own resources have loaded.
  useEffect(() => {
    if (closedThisLoad) return
    let t: ReturnType<typeof setTimeout> | undefined
    const show = () => {
      t = setTimeout(() => setReady(true), 600)
    }
    if (document.readyState === 'complete') show()
    else window.addEventListener('load', show, { once: true })
    return () => {
      window.removeEventListener('load', show)
      clearTimeout(t)
    }
  }, [])

  // Step aside while a request form is on screen, so the player never covers what the visitor is filling in.
  useEffect(() => {
    const forms = [...document.querySelectorAll('form[data-quick-request], form#request')]
    if (!forms.length) {
      setOverForm(false)
      return
    }
    const seen = new Set<Element>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target)
        else seen.delete(e.target)
      }
      setOverForm(seen.size > 0)
    })
    forms.forEach((f) => io.observe(f))
    return () => io.disconnect()
  }, [pathname])

  // On phones the hero's call-to-action buttons sit exactly where a bottom-corner player would land. While the page is
  // still at the top, park the player over the hero photo instead, then let it slide down to the corner on scroll.
  useEffect(() => {
    const hasHero = !!document.querySelector('[data-hero]')
    const sync = () => setDockTop(hasHero && window.scrollY < 80)
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [pathname])

  // React does not reliably write the muted attribute, and browsers refuse autoplay without it: set it and start
  // playback by hand. Visitors who ask for reduced motion get the player paused, with a play button.
  const visible = ready && !closed && !onRequestPage
  useEffect(() => {
    const v = video.current
    if (!visible || !v) return
    v.muted = true
    setMuted(true)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) userPaused.current = true
    if (!userPaused.current) void v.play().catch(() => {})
  }, [visible])

  // Pause while hidden behind a form and resume afterwards, unless the visitor paused it themselves.
  useEffect(() => {
    const v = video.current
    if (!visible || !v) return
    if (overForm) v.pause()
    else if (!userPaused.current) void v.play().catch(() => {})
  }, [overForm, visible])

  if (!visible) return null

  const togglePlay = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      userPaused.current = false
      void v.play().catch(() => {})
    } else {
      userPaused.current = true
      v.pause()
    }
  }
  const toggleMute = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }
  const fullscreen = () => {
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!v) return
    v.muted = false
    setMuted(false)
    if (v.requestFullscreen) void v.requestFullscreen().catch(() => {})
    else v.webkitEnterFullscreen?.()
  }

  const btn = 'flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-brand-red focus-visible:outline-2 focus-visible:outline-white'

  return (
    <aside aria-label="Promotional video" className="fixed right-4 z-40 w-56 animate-rise overflow-hidden rounded-xl bg-navy-900 shadow-2xl ring-1 ring-white/20 sm:w-64 lg:!bottom-6 lg:right-6 lg:w-72" style={position}>
      <video ref={video} src={VIDEO_SRC} autoPlay muted loop playsInline preload="metadata" className="block aspect-video w-full bg-black object-cover" />
      <div className="absolute right-2 top-2 flex gap-1.5">
        <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'} className={btn}>
          {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button type="button" onClick={fullscreen} aria-label="View video full screen" className={btn}>
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setOpened(false)} aria-label="Close video" className={btn}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
