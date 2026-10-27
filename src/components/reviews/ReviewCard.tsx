import { BadgeCheck, Clock } from 'lucide-react'
import type { ReviewItem } from '@/components/cms/sections'

/** Only third-party sources get a label; reviews sent directly or through this site carry none. */
const SOURCE_LABEL: Record<string, string> = { google: 'Google', yelp: 'Yelp', bbb: 'BBB' }

export function Stars({ rating, className = 'text-lg' }: { rating: number; className?: string }) {
  return (
    <p className={`tracking-wide text-amber-500 dark:text-[#fcd34d] ${className}`} aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="text-neutral-300 dark:text-white/20">{'★'.repeat(5 - rating)}</span>
    </p>
  )
}

/**
 * One customer review, as shown on the home page, service pages and /reviews. Shows only the fields that exist.
 * "Verified customer" appears only when an admin marked the review verified; `pending` is the visitor's own
 * just-sent review, which nobody else sees until it is approved.
 */
export function ReviewCard({ review: r, pending = false }: { review: ReviewItem; pending?: boolean }) {
  return (
    <figure className={`ui-card flex w-full flex-col p-5 ${pending ? 'border-dashed !border-terra/50' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        {r.rating > 0 && <Stars rating={r.rating} />}
        {pending ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-terra/10 px-2.5 py-0.5 text-xs font-semibold text-terra dark:text-[#F4A3A3]">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Awaiting approval
          </span>
        ) : (
          r.source && SOURCE_LABEL[r.source] && <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-neutral-700">{SOURCE_LABEL[r.source]}</span>
        )}
      </div>
      <blockquote className="ui-body mt-3 flex-1 whitespace-pre-line">“{r.text}”</blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-sm">
        <span className="font-semibold text-ink">
          {r.name}
          {r.city && <span className="font-normal text-neutral-600">, {r.city}</span>}
          {r.verified && !pending && (
            <span className="ml-2 inline-flex items-center gap-1 align-middle text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Verified customer
            </span>
          )}
        </span>
        <span className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
          {r.service && <span className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 font-semibold text-brand-blue">{r.service}</span>}
          {r.date && <span>{r.date}</span>}
        </span>
      </figcaption>
    </figure>
  )
}
