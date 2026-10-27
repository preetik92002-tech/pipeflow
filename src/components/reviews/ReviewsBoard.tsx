'use client'

import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { BadgeCheck, CheckCircle2, Lock, MessageSquarePlus, ShieldCheck, Star } from 'lucide-react'
import type { ReviewItem } from '@/components/cms/sections'
import { REVIEW_MAX_LENGTH, REVIEW_MIN_LENGTH, REVIEW_SERVICES, reviewSchema } from '@/lib/reviews/schema'
import { ReviewCard } from './ReviewCard'

const PAGE = 9
/** The visitor's own just-sent review, kept in this browser only so it survives a reload until it is approved. */
const PENDING_KEY = 'pipeflow:pending-review'
const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

type Sort = 'newest' | 'highest' | 'lowest'
type Errors = Partial<Record<'name' | 'city' | 'rating' | 'text' | 'service' | 'email' | 'consent' | 'form', string>>

function readPending(): ReviewItem | null {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as ReviewItem) : null
  } catch {
    return null
  }
}

/**
 * The review list and the write-a-review form on /reviews. Only approved reviews come from the server; a review the
 * visitor just sent is shown to them alone, marked as awaiting approval, and never counted in the figures.
 */
export function ReviewsBoard({ reviews }: { reviews: ReviewItem[] }) {
  const [sort, setSort] = useState<Sort>('newest')
  const [shown, setShown] = useState(PAGE)
  const [pending, setPending] = useState<ReviewItem | null>(null)

  useEffect(() => {
    const own = readPending()
    // Once the same review is live it appears in the list itself, so the private copy is dropped.
    if (own && reviews.some((r) => r.name === own.name && r.text === own.text)) {
      try { window.localStorage.removeItem(PENDING_KEY) } catch {}
      return
    }
    setPending(own)
  }, [reviews])

  const sorted = useMemo(() => {
    if (sort === 'newest') return reviews
    return [...reviews].sort((a, b) => (sort === 'highest' ? b.rating - a.rating : a.rating - b.rating))
  }, [reviews, sort])

  function onSubmitted(review: ReviewItem) {
    setPending(review)
    try { window.localStorage.setItem(PENDING_KEY, JSON.stringify(review)) } catch {}
    document.getElementById('review-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const hasAny = reviews.length > 0 || pending

  return (
    <>
      <section id="review-list" className="scroll-mt-24 bg-white section-y" aria-labelledby="review-list-title">
        <div className="container-wide">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="ui-kicker">Customer reviews</p>
              <h2 id="review-list-title" className="ui-h2 mt-2">
                {reviews.length ? 'Reviews from real customers' : 'No reviews yet'}
              </h2>
            </div>
            {reviews.length > 1 && (
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                Sort by
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="form-input !w-auto !py-2 text-sm">
                  <option value="newest">Newest first</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
              </label>
            )}
          </div>

          {hasAny ? (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6" aria-live="polite">
              {pending && (
                <li className="flex">
                  <ReviewCard review={pending} pending />
                </li>
              )}
              {sorted.slice(0, shown).map((r, i) => (
                <li key={`${r.name}-${i}`} className="flex">
                  <ReviewCard review={r} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-terra">
                <MessageSquarePlus className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="ui-h3 mt-4">Be the first to share your experience</p>
              <p className="ui-body mt-2 max-w-md text-neutral-600">
                We only show reviews from real customers, so this page starts empty. If we helped you, a few words help your neighbors choose.
              </p>
              <a href="#write-review" className="ui-btn ui-btn-primary mt-6">
                Write a review
              </a>
            </div>
          )}

          {sorted.length > shown && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="ui-btn ui-btn-secondary">
                Show more reviews ({sorted.length - shown} more)
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="write-review" className="scroll-mt-24 border-t border-line bg-paper section-y" aria-labelledby="write-review-title">
        <div className="container-wide grid gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="ui-kicker">Share your experience</p>
            <h2 id="write-review-title" className="ui-h2 mt-2">
              Write a review
            </h2>
            <p className="ui-body mt-3">Tell other homeowners in Denver and Boulder how your plumbing or HVAC job went. Honest reviews, good or bad, are welcome.</p>
            <ul className="mt-6 space-y-4">
              {[
                { Icon: ShieldCheck, title: 'Read before it appears', text: 'We check every review before publishing it. We never edit what you say or remove a review because it is critical.' },
                { Icon: BadgeCheck, title: 'Verified customer badge', text: 'Shown only after we match your review to a real service request.' },
                { Icon: Lock, title: 'Your email stays private', text: 'We use it only to confirm you are a customer. It is never shown on the site.' },
              ].map(({ Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white text-terra ring-1 ring-line dark:bg-[#0F2040] dark:ring-white/10">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold leading-snug text-ink">{title}</span>
                    <span className="mt-0.5 block text-[0.95rem] leading-snug text-neutral-600">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <ReviewForm onSubmitted={onSubmitted} />
          </div>
        </div>
      </section>
    </>
  )
}

function StarPicker({ value, onChange, error, labelId }: { value: number; onChange: (n: number) => void; error?: string; labelId: string }) {
  const [hover, setHover] = useState(0)
  const name = useId()
  const lit = hover || value
  return (
    <div>
      <div role="radiogroup" aria-labelledby={labelId} aria-invalid={error ? true : undefined} className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer rounded-md p-1 focus-within:ring-2 focus-within:ring-terra" onMouseEnter={() => setHover(n)}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" />
            <Star className={`h-8 w-8 transition-colors ${n <= lit ? 'fill-amber-400 text-amber-500 dark:fill-[#fcd34d] dark:text-[#fcd34d]' : 'fill-transparent text-neutral-300 dark:text-white/25'}`} aria-hidden="true" />
            <span className="sr-only">
              {n} star{n > 1 ? 's' : ''}, {RATING_WORDS[n]}
            </span>
          </label>
        ))}
        <span className="ml-2 text-sm font-semibold text-neutral-600" aria-hidden="true">
          {RATING_WORDS[lit]}
        </span>
      </div>
    </div>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-red-700 dark:text-red-300">
      {message}
    </p>
  )
}

function ReviewForm({ onSubmitted }: { onSubmitted: (review: ReviewItem) => void }) {
  const uid = useId()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [service, setService] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [openedAt, setOpenedAt] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => setOpenedAt(new Date().toISOString()), [])

  const id = (f: string) => `${uid}-${f}`
  const described = (f: keyof Errors) => (errors[f] ? { 'aria-invalid': true, 'aria-describedby': id(`${f}-error`) } : {})

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const payload = { name, city, rating, text, service, email, consent, website_url_hp: honeypot, formOpenedAt: openedAt || undefined }
    const parsed = reviewSchema.safeParse(payload)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors
        if (key && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      document.getElementById(id(Object.keys(next)[0] ?? 'name'))?.focus()
      return
    }
    setErrors({})
    setBusy(true)
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setErrors({ form: result.error || 'We could not save your review. Please try again.' })
        return
      }
      onSubmitted({ name: name.trim(), city: city.trim() || undefined, rating, text: text.trim(), service: service || undefined, date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) })
      setDone(true)
    } catch {
      setErrors({ form: 'We could not reach the server. Check your connection and try again.' })
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="ui-card p-6 sm:p-8" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <h3 className="ui-h3 mt-4">Thank you for your review</h3>
        <p className="ui-body mt-2">
          It is now waiting for approval. You can see it above, marked &ldquo;Awaiting approval&rdquo;; other visitors will see it once we have checked it.
        </p>
        <a href="#review-list" className="ui-link mt-5">
          See your review
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="ui-card space-y-5 p-5 sm:p-8" aria-labelledby="write-review-title">
      <div>
        <p id={id('rating-label')} className="form-label !text-sm !text-ink">
          Your rating <span className="text-terra">*</span>
        </p>
        <StarPicker value={rating} onChange={(n) => { setRating(n); setErrors((x) => ({ ...x, rating: undefined })) }} error={errors.rating} labelId={id('rating-label')} />
        <FieldError id={id('rating-error')} message={errors.rating} />
      </div>

      <div>
        <label htmlFor={id('text')} className="form-label !text-sm !text-ink">
          Your review <span className="text-terra">*</span>
        </label>
        <textarea
          id={id('text')}
          rows={5}
          value={text}
          maxLength={REVIEW_MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          placeholder="What was the problem, and how did the job go?"
          className={`form-input !text-base ${errors.text ? 'form-input-error' : ''}`}
          {...described('text')}
        />
        <div className="mt-1 flex justify-between gap-3">
          <FieldError id={id('text-error')} message={errors.text} />
          <span className="ml-auto text-xs text-neutral-500">
            {text.trim().length < REVIEW_MIN_LENGTH ? `${REVIEW_MIN_LENGTH - text.trim().length} more characters needed` : `${text.length}/${REVIEW_MAX_LENGTH}`}
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id('name')} className="form-label !text-sm !text-ink">
            Your name <span className="text-terra">*</span>
          </label>
          <input id={id('name')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Sarah M." className={`form-input !text-base ${errors.name ? 'form-input-error' : ''}`} {...described('name')} />
          <FieldError id={id('name-error')} message={errors.name} />
        </div>
        <div>
          <label htmlFor={id('city')} className="form-label !text-sm !text-ink">
            City <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input id={id('city')} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" placeholder="e.g. Denver" className={`form-input !text-base ${errors.city ? 'form-input-error' : ''}`} {...described('city')} />
          <FieldError id={id('city-error')} message={errors.city} />
        </div>
        <div>
          <label htmlFor={id('service')} className="form-label !text-sm !text-ink">
            Service <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <select id={id('service')} value={service} onChange={(e) => setService(e.target.value)} className={`form-input !text-base ${errors.service ? 'form-input-error' : ''}`} {...described('service')}>
            <option value="">Choose a service</option>
            {REVIEW_SERVICES.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.labels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <FieldError id={id('service-error')} message={errors.service} />
        </div>
        <div>
          <label htmlFor={id('email')} className="form-label !text-sm !text-ink">
            Email <span className="text-terra">*</span>
          </label>
          <input id={id('email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" className={`form-input !text-base ${errors.email ? 'form-input-error' : ''}`} {...described('email')} />
          <FieldError id={id('email-error')} message={errors.email} />
          {!errors.email && <p className="mt-1.5 text-xs text-neutral-500">Never shown publicly.</p>}
        </div>
      </div>

      {/* Bots fill every field; people never see this one. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-[0.95rem] leading-snug text-neutral-700 dark:text-[#AEBBD0]">
          <input id={id('consent')} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none rounded border-neutral-300 accent-terra" {...described('consent')} />
          This review is about my own experience, and PipeFlowCo may publish it with the name and city I entered.
        </label>
        <FieldError id={id('consent-error')} message={errors.consent} />
      </div>

      {errors.form && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-200">
          {errors.form}
        </p>
      )}

      <button type="submit" disabled={busy} aria-busy={busy} className="ui-btn ui-btn-primary w-full sm:w-auto">
        {busy ? 'Sending…' : 'Submit review'}
      </button>
    </form>
  )
}
