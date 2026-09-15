'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface AnnouncementBarProps {
  messages: string[]
  className?: string
}

export function AnnouncementBar({ messages, className }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (messages.length <= 1) return
    const interval = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length)
        setAnimating(false)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [messages.length])

  if (dismissed || messages.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Announcements"
      className={cn('bg-navy-900 text-white text-xs sm:text-sm', className)}
    >
      <div className="container-site flex items-center justify-between py-2 gap-4 min-h-[34px]">
        <div className="flex-1 text-center">
          <span
            className={cn(
              'inline-block transition-all duration-300',
              animating ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
            )}
          >
            {messages[currentIndex]}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="flex-shrink-0 rounded p-1 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
export default AnnouncementBar
