'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Play,
  Pause,
  Sparkles,
  Tv,
} from 'lucide-react'
import { VideoModal } from './VideoModal'

interface FloatingVideoProps {
  videoSrc?: string
  delayMs?: number
}

const STORAGE_KEY = 'pipeflow_video_dismissed'

export function FloatingVideo({
  videoSrc = '/assets/add.mp4',
  delayMs = 2500,
}: FloatingVideoProps) {
  const [mounted, setMounted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setMounted(true)

    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionQuery.matches)

    // Check session dismissal
    const dismissed = sessionStorage.getItem(STORAGE_KEY) === 'true'
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    setIsDismissed(false)

    // Delay entrance
    const timer = setTimeout(() => {
      setIsVisible(true)
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Autoplay blocked by browser policy; user interaction will initiate
          setIsPlaying(false)
        })
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [delayMs])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    setTimeout(() => {
      setIsDismissed(true)
      sessionStorage.setItem(STORAGE_KEY, 'true')
    }, 400)
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().catch(() => {})
        setIsPlaying(true)
      }
    }
  }

  const handleOpenModal = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {})
    }
  }

  if (!mounted || isDismissed) return null

  return (
    <>
      {/* Minimized Bubble (if user minimizes on mobile) */}
      {isMinimized && isVisible && (
        <div
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 bg-navy-900 text-white p-3 rounded-full shadow-2xl border border-brand-blue/50 cursor-pointer flex items-center gap-2 hover:scale-105 transition-all group"
          role="button"
          aria-label="Expand PipeFlow promotional video"
        >
          <div className="relative">
            <Tv className="h-5 w-5 text-brand-blue-lighter" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red" />
            </span>
          </div>
          <span className="text-xs font-semibold pr-1">Watch Story</span>
        </div>
      )}

      {/* Floating Video Widget Card */}
      {!isMinimized && (
        <div
          className={`fixed bottom-24 right-3 sm:bottom-6 sm:right-6 z-40 w-[240px] sm:w-[320px] md:w-[350px] bg-navy-900 rounded-2xl overflow-hidden shadow-2xl border border-navy-700/80 transition-all duration-500 transform ${
            isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
          style={prefersReducedMotion ? { transition: 'none' } : undefined}
          aria-label="PipeFlow promotional service video"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-navy-950/90 border-b border-navy-800">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-2xs font-semibold uppercase tracking-wider text-neutral-200">
                PipeFlow Denver Story
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleOpenModal}
                title="Expand video"
                aria-label="Expand video in full modal"
                className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-navy-800 transition-colors"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                title="Close video"
                aria-label="Dismiss promotional video"
                className="p-1 text-neutral-400 hover:text-brand-red rounded-md hover:bg-navy-800 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Video Container — Click to open modal */}
          <div
            onClick={handleOpenModal}
            className="relative aspect-video w-full bg-black cursor-pointer group overflow-hidden"
          >
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Interactive Hover Controls Overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="p-1.5 rounded-lg bg-navy-900/80 hover:bg-navy-900 text-white backdrop-blur-xs transition-colors border border-white/10"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5 text-neutral-200" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-brand-blue-lighter fill-current" />
                )}
              </button>

              {/* Mute Indicator & Unmute Button */}
              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Tap to unmute' : 'Mute audio'}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-navy-900/80 hover:bg-navy-900 text-white backdrop-blur-xs transition-colors text-2xs font-semibold border border-white/10"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-neutral-300">Unmute</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-brand-blue-lighter" />
                    <span className="text-brand-blue-lighter">Mute</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Quick Bar */}
          <div
            onClick={handleOpenModal}
            className="p-2 bg-navy-950 flex items-center justify-between text-2xs cursor-pointer hover:bg-navy-900 transition-colors border-t border-navy-800"
          >
            <span className="text-neutral-300 font-medium truncate">
              Tap to expand &amp; explore services
            </span>
            <span className="text-brand-blue-lighter font-semibold flex items-center gap-1">
              <span>View</span>
              <span>→</span>
            </span>
          </div>
        </div>
      )}

      {/* Expanded Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        videoSrc={videoSrc}
      />
    </>
  )
}

export default FloatingVideo
