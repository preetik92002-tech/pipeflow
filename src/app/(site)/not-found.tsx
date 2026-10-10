import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/** 404: seedha rasta wapas, sirf wahi links jo sach mein maujood hain (/plumbing, /hvac, /book-service). */
export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-paper">
      <div className="container-wide py-24 sm:py-32 lg:py-40">
        <div className="hero-enter max-w-3xl">
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-5 font-display text-display-2xl font-bold text-ink">This page isn&apos;t here.</h1>
          <p className="mt-6 max-w-xl text-lead text-neutral-700">
            The address may have changed, or the page may not be published yet. Choose where to go next, or send us a service request.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/book-service" className="cta cta-solid">
              Request Service
              <ArrowRight className="cta-arrow" aria-hidden="true" />
            </Link>
            <Link href="/" className="cta cta-line">Back to the homepage</Link>
          </div>
        </div>
        <ul className="mt-16 grid max-w-3xl border-t border-line sm:grid-cols-3">
          {[
            { label: 'Plumbing services', href: '/plumbing' },
            { label: 'HVAC services', href: '/hvac' },
            { label: 'Denver & Boulder', href: '/denver' },
          ].map((l) => (
            <li key={l.href} className="border-b border-line sm:border-b-0 sm:border-r sm:last:border-r-0">
              <Link href={l.href} className="group flex items-center justify-between gap-4 px-0 py-5 font-display text-lg font-semibold text-ink sm:px-6 sm:first:pl-0">
                {l.label}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-red" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
