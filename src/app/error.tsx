'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home, Phone } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GLOBAL ERROR LOGGED]', error)
  }, [error])

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-neutral-50 px-4 py-20">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center mx-auto mb-5 border border-red-100">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-bold font-display text-navy-900 mb-2">
          Something Went Wrong
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
          We encountered an unexpected technical glitch. Our technical team has been notified. If
          you require immediate service or emergency dispatch, please call us directly.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary w-full !py-3 text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Try Loading Again
          </button>

          <Link
            href="/"
            className="btn-outline w-full !py-3 text-xs flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Homepage
          </Link>

          <a
            href={`tel:${siteConfig.company.phone}`}
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-brand-red hover:underline pt-3"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Emergency 24/7 Dispatch: {siteConfig.company.phone}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
