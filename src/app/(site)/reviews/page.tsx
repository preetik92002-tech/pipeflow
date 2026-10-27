import type { Metadata } from 'next'
import { BadgeCheck } from 'lucide-react'
import { ReviewsBoard } from '@/components/reviews/ReviewsBoard'
import { Stars } from '@/components/reviews/ReviewCard'
import { getReviewSummary, type ReviewSummary } from '@/lib/cms/queries'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

// Approving a review in the admin revalidates every page at once; this is only the safety net.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: 'Customer Reviews: Plumbing & HVAC in Denver & Boulder',
    description: 'Read what real customers say about plumbing and HVAC service in Denver and Boulder, and share your own experience.',
    path: '/reviews',
  })
}

/**
 * The figures on the right of the hero. Rendered only when at least one approved review exists, and every number
 * is computed from those same reviews: no rating or count is shown before it is real.
 */
function Summary({ summary }: { summary: ReviewSummary }) {
  const { average, count, verified, distribution } = summary
  return (
    <div className="ui-card p-5 sm:p-6" aria-label="Rating summary">
      <div className="flex items-center gap-4">
        {average !== null && <p className="font-display text-5xl font-semibold leading-none text-ink">{average.toFixed(1)}</p>}
        <div>
          {average !== null && <Stars rating={Math.round(average)} className="text-xl" />}
          <p className="mt-1 text-sm text-neutral-600">
            Based on {count} customer review{count === 1 ? '' : 's'}
          </p>
        </div>
      </div>
      <dl className="mt-5 space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const n = distribution[stars - 1]
          return (
            <div key={stars} className="flex items-center gap-3 text-sm">
              <dt className="w-12 flex-none font-semibold text-neutral-700 dark:text-[#AEBBD0]">
                {stars} star{stars > 1 ? 's' : ''}
              </dt>
              <dd className="flex flex-1 items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-mist dark:bg-white/10" aria-hidden="true">
                  <span className="block h-full rounded-full bg-amber-400 dark:bg-[#fcd34d]" style={{ width: `${count ? (n / count) * 100 : 0}%` }} />
                </span>
                <span className="w-8 text-right tabular-nums text-neutral-600">{n}</span>
              </dd>
            </div>
          )
        })}
      </dl>
      {verified > 0 && (
        <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-sm text-neutral-600">
          <BadgeCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          {verified} from verified customers
        </p>
      )}
    </div>
  )
}

export default async function ReviewsPage() {
  const summary = await getReviewSummary()
  const hasReviews = summary.count > 0

  return (
    <div className="bg-paper">
      <section className="border-b border-line">
        <div className={`container-wide grid gap-10 py-14 sm:py-20 ${hasReviews ? 'lg:grid-cols-12 lg:items-center' : ''}`}>
          <div className={`hero-enter max-w-3xl ${hasReviews ? 'lg:col-span-7' : ''}`}>
            <p className="eyebrow">Denver &amp; Boulder</p>
            <h1 className="mt-5 font-display text-display-xl font-normal text-ink">What customers say</h1>
            <p className="mt-5 max-w-2xl text-lead text-neutral-700">
              Honest reviews from homeowners and businesses we have helped with plumbing and HVAC work. Every review is from a real customer and is read before it appears here.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#write-review" className="ui-btn ui-btn-primary">
                Write a review
              </a>
              {hasReviews && (
                <a href="#review-list" className="ui-btn ui-btn-secondary">
                  Read reviews
                </a>
              )}
            </div>
          </div>
          {hasReviews && (
            <div className="lg:col-span-5">
              <Summary summary={summary} />
            </div>
          )}
        </div>
      </section>
      <ReviewsBoard reviews={summary.items} />
    </div>
  )
}
