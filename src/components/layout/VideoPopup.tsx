'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2, Volume2, VolumeX, X } from 'lucide-react'

const VIDEO_SRC = '/assets/add.mp4'
// Kept in memory only: closing hides it while the visitor browses, and it comes back on the next page load.
let closedThisLoad = false

/** Small autoplaying ad on public pages: muted at first (browsers require it), with mute/unmute, full screen and close. */
export function VideoPopup() {
  const [visible, setVisible] = useState(false)
  const [muted, setMuted] = useState(true)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (closedThisLoad) return
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [])

  // React does not reliably write the muted attribute, and browsers refuse autoplay without it: set it and start playback by hand.
  useEffect(() => {
    const v = video.current
    if (!visible || !v) return
    v.muted = true
    void v.play().catch(() => {})
  }, [visible])

  if (!visible) return null

  const close = () => {
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
