'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { X, Volume2, VolumeX } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoSrc?: string
}

export function VideoModal({
  isOpen,
  onClose,
  videoSrc = '/assets/add.mp4',
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [muteBlocked, setMuteBlocked] = useState(false)

  // ── Keyboard dismiss ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ── Play/pause based on open state ──────────────────────────────────────
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      vid.currentTime = 0

      // Since modal opens via user interaction (click), try unmuted first
      vid.muted = false
      vid.volume = 1
      vid.play()
        .then(() => {
          setIsMuted(false)
          setMuteBlocked(false)
        })
        .catch(() => {
          // Browser blocked unmuted autoplay — fall back to muted
          vid.muted = true
          setIsMuted(true)
          setMuteBlocked(true)
          vid.play().catch(() => {})
        })
    } else {
      document.body.style.overflow = ''
      vid.pause()
      // Reset for next open
      setIsMuted(true)
      setMuteBlocked(false)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ── Sound toggle ─────────────────────────────────────────────────────────
  const handleToggleSound = useCallback(async () => {
    const vid = videoRef.current
    if (!vid) return

    if (isMuted) {
      vid.muted = false
      vid.volume = 1
      try {
        await vid.play()
        setIsMuted(false)
        setMuteBlocked(false)
      } catch {
        vid.muted = true
        setIsMuted(true)
        setMuteBlocked(true)
      }
    } else {
      vid.muted = true
      setIsMuted(true)
    }
  }, [isMuted])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="PipeFlow Promotional Video"
    >
      {/* Background overlay click to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl z-10">

        {/* ── Close button ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className={[
            'absolute top-3 right-3 z-20',
            'w-9 h-9 flex items-center justify-center',
            'rounded-full bg-black/60 hover:bg-black/80',
            'text-white border border-white/20',
            'transition-colors duration-150',
          ].join(' ')}
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Video ─────────────────────────────────────────────────────── */}
        <div className="relative w-full aspect-video bg-black">
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            preload="metadata"
            muted={isMuted}
            className="w-full h-full object-contain"
          />

          {/* ── Sound toggle — prominent, bottom-left ─────────────────── */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Enable sound' : 'Mute video'}
            className={[
              'absolute bottom-4 left-4',
              'flex items-center gap-2',
              'px-3.5 py-2 rounded-xl',
              'text-sm font-semibold',
              'border backdrop-blur-sm',
              'transition-all duration-200',
              isMuted
                ? 'bg-black/70 border-white/25 text-white hover:bg-black/90'
                : 'bg-white/95 border-neutral-200 text-neutral-900 hover:bg-white',
            ].join(' ')}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 flex-shrink-0" />
                <span>
                  {muteBlocked ? 'Click to enable sound' : '🔊 Tap for Sound'}
                </span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 flex-shrink-0 text-brand-blue" />
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoModal
