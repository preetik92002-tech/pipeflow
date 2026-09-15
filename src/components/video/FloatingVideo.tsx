'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Volume2, VolumeX } from 'lucide-react'
import { VideoModal } from './VideoModal'

interface FloatingVideoProps {
  videoSrc?: string
  delayMs?: number
}

const STORAGE_KEY = 'pipeflow_video_dismissed'

export function FloatingVideo({
  videoSrc = '/assets/add.mp4',
  delayMs = 3000,
}: FloatingVideoProps) {
  const [mounted, setMounted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [muteBlocked, setMuteBlocked] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ── Mount + session check + delayed reveal ──────────────────────────────
  useEffect(() => {
    setMounted(true)

    const dismissed = sessionStorage.getItem(STORAGE_KEY) === 'true'
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    setIsDismissed(false)

    const timer = setTimeout(() => {
      setIsVisible(true)
      // Always start muted to comply with browser autoplay policies
      const vid = videoRef.current
      if (vid) {
        vid.muted = true
        vid.play().catch(() => {
          // Autoplay blocked entirely — video will wait for user interaction
        })
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [delayMs])

  // ── Pause when tab is hidden, resume when visible ────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      const vid = videoRef.current
      if (!vid) return
      if (document.hidden) {
        vid.pause()
      } else if (isVisible && !isDismissed) {
        vid.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isVisible, isDismissed])

  // ── Dismiss ──────────────────────────────────────────────────────────────
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    setTimeout(() => {
      setIsDismissed(true)
      sessionStorage.setItem(STORAGE_KEY, 'true')
      videoRef.current?.pause()
    }, 400)
  }

  // ── Sound toggle ─────────────────────────────────────────────────────────
  const handleToggleSound = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    const vid = videoRef.current
    if (!vid) return

    if (isMuted) {
      // Attempt to unmute + play with sound
      vid.muted = false
      vid.volume = 1
      try {
        await vid.play()
        setIsMuted(false)
        setMuteBlocked(false)
      } catch {
        // Browser rejected audible playback — revert to muted
        vid.muted = true
        setIsMuted(true)
        setMuteBlocked(true)
      }
    } else {
      vid.muted = true
      setIsMuted(true)
      setMuteBlocked(false)
    }
  }, [isMuted])

  // ── Open/close modal ────────────────────────────────────────────────────
  const handleOpenModal = () => {
    videoRef.current?.pause()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Resume mini-player (muted to respect autoplay)
    const vid = videoRef.current
    if (vid) {
      vid.muted = isMuted
      vid.play().catch(() => {})
    }
  }

  if (!mounted || isDismissed) return null

  return (
    <>
      {/* ── Floating mini video widget ─────────────────────────────────── */}
      <div
        className={[
          // Position: bottom-right, above mobile sticky CTA
          'fixed bottom-[72px] right-4',
          'sm:bottom-6 sm:right-6',
          'z-40',
          // Size
          'w-[260px] sm:w-[310px] md:w-[340px]',
          // Container style: plain white border, subtle shadow
          'bg-white rounded-xl overflow-hidden',
          'border border-[#e5e7eb]',
          'shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
          // Entrance animation (opacity + slide up)
          'transition-[opacity,transform] duration-400 ease-out',
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-[15px] pointer-events-none',
        ].join(' ')}
        aria-label="PipeFlow promotional video"
      >
        {/* ── Close X ──────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close promotional video"
          className={[
            'absolute top-2 right-2 z-10',
            'w-6 h-6 flex items-center justify-center',
            'rounded-full bg-white/90 hover:bg-white',
            'border border-[#e5e7eb] shadow-sm',
            'text-neutral-500 hover:text-neutral-900',
            'transition-colors duration-150',
          ].join(' ')}
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* ── Video — click to open lightbox ───────────────────────────── */}
        <div
          className="relative w-full aspect-video bg-black cursor-pointer group"
          onClick={handleOpenModal}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />

          {/* ── Sound toggle — clearly visible, bottom-left of video ──── */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Tap to enable sound' : 'Mute sound'}
            className={[
              'absolute bottom-2.5 left-2.5',
              'flex items-center gap-1.5',
              'px-2.5 py-1.5 rounded-lg',
              'text-xs font-semibold',
              'backdrop-blur-sm border',
              'transition-all duration-200',
              isMuted
                ? 'bg-black/60 border-white/20 text-white hover:bg-black/80'
                : 'bg-white/90 border-white/60 text-neutral-900 hover:bg-white',
            ].join(' ')}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{muteBlocked ? 'Click to try sound' : '🔊 Tap for sound'}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-brand-blue" />
                <span>Sound on</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Lightbox modal ──────────────────────────────────────────────── */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        videoSrc={videoSrc}
      />
    </>
  )
}

export default FloatingVideo
