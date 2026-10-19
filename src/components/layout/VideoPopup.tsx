'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Maximize2, Play, Volume2, VolumeX, X } from 'lucide-react'

const VIDEO_SRC = '/assets/add.mp4'
// Kept in memory only: dismissing the launcher hides it while the visitor browses; it comes back on the next page load.
let dismissedThisLoad = false

/**
 * The promotional video. It never opens over the page by itself: a small "Watch our video" launcher appears once the
 * hero has scrolled away, and the player (muted at first, with mute/unmute, full screen and close) opens only when the
 * visitor asks for it. Closing the player returns to the launcher; the launcher's own × hides it for this visit.
 * The launcher steps aside while a request form is on screen, and does not appear on the request page itself.
 */
export function VideoPopup() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [opened, setOpened] = useState(false)
  const [overForm, setOverForm] = useState(false)
  const [muted, setMuted] = useState(true)
  const video = useRef<HTMLVideoElement>(null)
  const onRequestPage = pathname.startsWith('/book-service')

  // Home: the launcher steps aside while the hero request form is on screen (e.g. after scrolling back up to it).
  useEffect(() => {
    const form = home ? document.querySelector('section[data-hero] form') : null
    if (!form) return
    const io = new IntersectionObserver(([entry]) => setOverForm(entry.isIntersecting))
    io.observe(form)
    return () => io.disconnect()
  }, [home])
  const [muted, setMuted] = useState(true)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (closedThisLoad) return
    let t: ReturnType<typeof setTimeout> | undefined
    const show = () => {
      t = setTimeout(() => setVisible(true), 1500)
    }
    if (!home) {
      show()
      return () => clearTimeout(t)
    }
    // Home page: keep the first screen (hero text, buttons and request form) clear; show the ad once the hero has mostly scrolled away.
    const heroGone = () => {
      const hero = document.querySelector('[data-hero]')
      return !hero || hero.getBoundingClientRect().bottom < window.innerHeight * 0.6
    }
    const onScroll = () => {
      if (!heroGone()) return
      window.removeEventListener('scroll', onScroll)
      show()
    }
    if (heroGone()) show()
    else window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(t)
    }
  }, [home])

  // React does not reliably write the muted attribute, and browsers refuse autoplay without it: set it and start playback by hand.
  useEffect(() => {
    const v = video.current
    if (!visible || !(opened || !home) || !v) return
    v.muted = true
    setMuted(true)
    void v.play().catch(() => {})
  }, [visible, opened, home])

  if (!visible) return null

  if (home && !opened) {
    if (overForm) return null
    return (
      <button
        type="button"
        onClick={() => setOpened(true)}
        aria-label="Watch our video"
        className="fixed right-4 z-40 flex animate-rise items-center gap-2 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl ring-1 ring-white/25 transition-colors hover:bg-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:bottom-6 lg:right-6"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        <Play className="h-4 w-4" aria-hidden="true" />
        Watch our video
      </button>
    )
  }

  const close = () => {
    if (home) {
      setOpened(false)
      return
    }
    closedThisLoad = true
    setVisible(false)
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

  const btn = 'flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-brand-red focus-visible:outline-2 focus-visible:outline-white'

  return (
    <aside aria-label="Promotional video" className="fixed bottom-20 right-4 z-40 w-44 animate-rise overflow-hidden rounded-xl bg-navy-900 shadow-2xl ring-1 ring-white/20 sm:w-56 lg:bottom-6 lg:right-6 lg:w-72">
      <video ref={video} src={VIDEO_SRC} autoPlay muted loop playsInline preload="metadata" className="block aspect-video w-full bg-black object-cover" />
      <div className="absolute right-2 top-2 flex gap-1.5">
        <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'} className={btn}>
          {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button type="button" onClick={fullscreen} aria-label="View video full screen" className={btn}>
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={close} aria-label="Close video" className={btn}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
