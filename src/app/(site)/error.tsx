'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, RotateCcw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Sirf digest log hota hai: poora error object user ke browser console mein internals na dikhaye.
    console.error('[site error]', error.digest ?? 'no-digest')
  }, [error])

  return (
    <section className="bg-paper">
      <div className="container-wide py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl" role="alert">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="mt-5 font-display text-display-xl font-normal text-ink">We couldn&apos;t load this page.</h1>
          <p className="mt-6 max-w-xl text-lead text-neutral-700">Please try again. If the problem continues you can still send a service request and we&apos;ll take it from there.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => reset()} className="cta cta-solid">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
            <Link href="/book-service" className="cta cta-line">
              Request Service
              <ArrowRight className="cta-arrow" aria-hidden="true" />
            </Link>
            <Link href="/" className="cta cta-line">
              Back to the homepage
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
