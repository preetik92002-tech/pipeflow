import Link from 'next/link'
import { Droplets, Home, Phone, Calendar, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-neutral-50 px-4 py-20">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mx-auto mb-5 border border-blue-100">
          <Droplets className="h-8 w-8" />
        </div>

        <span className="text-4xl sm:text-5xl font-extrabold font-display text-navy-900 block mb-2">
          404
        </span>

        <h1 className="text-xl sm:text-2xl font-bold text-navy-900 mb-3">
          Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-8">
          The page you are looking for may have moved or no longer exists. Let&apos;s get you back
          to the right pipe or heating solution.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="btn-primary w-full !py-3 text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <Home className="h-4 w-4" />
            Return to Homepage
          </Link>

          <Link
            href="/services"
            className="btn-outline w-full !py-3 text-xs flex items-center justify-center gap-2"
          >
            View Our Plumbing &amp; HVAC Services
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <a
            href={`tel:${siteConfig.company.phone}`}
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-neutral-600 hover:text-navy-900 pt-3 transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-brand-red" />
            <span>Need immediate help? Call {siteConfig.company.phone}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
