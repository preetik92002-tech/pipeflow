'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Sirf digest log hota hai: poora error object user ke browser console mein internals na dikhaye.
    console.error('[site error]', error.digest ?? 'no-digest')
  }, [error])

  return (
    <section className="bg-paper">
      <div className="container-wide relative py-24 sm:py-32 lg:py-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/mascot/pose-1.webp" alt="" width={385} height={402} className="pointer-events-none absolute bottom-10 right-6 hidden h-64 w-auto lg:block xl:h-80" aria-hidden="true" />
        <div className="max-w-3xl" role="alert">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="mt-5 font-display text-display-xl font-normal text-ink">We couldn&apos;t load this page.</h1>
          <p className="mt-6 max-w-xl text-lead text-neutral-700">Please try again. If the problem continues you can still send a service request and we&apos;ll take it from there.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => reset()} className="btn-primary !px-6 !py-3">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
            <Link href="/book-service" className="btn-outline !px-6 !py-3">
              Request Service
            </Link>
            <Link href="/" className="btn-outline !px-6 !py-3">
              Back to the homepage
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
