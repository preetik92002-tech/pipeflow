'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Calendar, FileText, Phone, Volume2, VolumeX } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

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
  const [isMuted, setIsMuted] = React.useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(() => {})
      }
    } else {
      document.body.style.overflow = ''
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-navy-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="PipeFlow Promotional Video"
    >
      {/* Background click dismiss */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-navy-900 rounded-3xl overflow-hidden shadow-2xl border border-navy-700/80 z-10 flex flex-col animate-slide-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800 bg-navy-900/90">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="PipeFlow Co."
              width={120}
              height={36}
              className="h-7 w-auto"
            />
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-brand-blue-lighter bg-brand-blue/20 px-2.5 py-0.5 rounded-full">
              Denver Service Spotlight
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted
                  setIsMuted(!isMuted)
                }
              }}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              className="p-2 text-neutral-300 hover:text-white rounded-xl hover:bg-navy-800 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-neutral-400" />
              ) : (
                <Volume2 className="h-5 w-5 text-brand-blue-lighter" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close video modal"
              className="p-2 text-neutral-300 hover:text-white rounded-xl hover:bg-navy-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 sm:p-6 bg-navy-950/90 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-white font-heading">
              Ready for high-quality, dependable home service?
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Denver Front Range licensed master plumbers &amp; HVAC technicians. Upfront pricing guaranteed.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={siteConfig.ctas.getQuote.href}
              onClick={onClose}
              className="btn-outline !py-2.5 !px-4 !text-xs !text-white !border-white/20 hover:!bg-white/10 flex-1 sm:flex-none justify-center"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{siteConfig.ctas.getQuote.label}</span>
            </Link>

            <Link
              href={siteConfig.ctas.bookService.href}
              onClick={onClose}
              className="btn-primary !py-2.5 !px-5 !text-xs flex-1 sm:flex-none justify-center shadow-md shadow-brand-red/25"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{siteConfig.ctas.bookService.label}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoModal
