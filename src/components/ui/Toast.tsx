'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />,
}

export function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed bottom-20 right-4 z-50 flex items-start gap-3 rounded-xl border bg-white p-4 shadow-card-hover max-w-sm w-full animate-slide-up lg:bottom-4'
      )}
    >
      {icons[type]}
      <p className="flex-1 text-sm text-neutral-700">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
export default Toast
