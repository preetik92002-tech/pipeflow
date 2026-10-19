'use client'

import { useId, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { SERVICES, ZIP_ERROR, isServiceZip } from '@/lib/requests/schema'

const DEFAULT_SERVICE = 'plumbing:water-heater-repair'

/** Every service the request flow supports, as "category:value" options (the flow's own catalog, nothing extra). */
const OPTIONS = (['plumbing', 'hvac'] as const).flatMap((category) =>
  SERVICES[category].map((s) => ({ key: `${category}:${s.value}`, label: s.label, group: category === 'plumbing' ? 'Plumbing' : 'HVAC' }))
)

const field =
  'mt-1 w-full rounded-lg border border-white/25 bg-navy-800 px-3.5 py-2.5 text-base text-white placeholder:text-white/50 focus:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 aria-[invalid=true]:border-red-400'

/**
 * Quick start for a service request. It only collects what a visitor can choose in seconds, checks the ZIP with the
 * shared rule and opens the existing request flow (/book-service) with those answers filled in. Nothing is saved here:
 * the full flow still asks for the address and contact details and does the real submission.
 */
export function QuickRequestForm({ id }: { id?: string }) {
  const uid = useId()
  const [service, setService] = useState(DEFAULT_SERVICE)
  const [zip, setZip] = useState('')
  const [property, setProperty] = useState<'residential' | 'commercial'>('residential')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const value = zip.trim()
    if (!isServiceZip(value)) {
      setError(value ? ZIP_ERROR : 'Enter your ZIP code, for example 80202.')
      return
    }
    setError(null)
    setBusy(true)
    const [category, svc] = service.split(':')
    const params = new URLSearchParams({ category, service: svc, zip: value, type: property === 'commercial' ? 'business' : 'homeowner' })
    window.location.assign(`/book-service?${params.toString()}`)
    // If navigation stalls, let the visitor try again instead of leaving the button locked.
    setTimeout(() => setBusy(false), 8000)
  }

  return (
    <form id={id} data-quick-request onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`} className="scroll-mt-28 rounded-xl border border-white/15 bg-navy-900/60 p-5 sm:p-6">
      <h3 id={`${uid}-title`} className="font-display text-xl font-semibold text-white">
        Start a request
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <div>
          <label htmlFor={`${uid}-service`} className="text-sm font-semibold text-white/90">
            Service needed
          </label>
          <select id={`${uid}-service`} className={field} value={service} onChange={(e) => setService(e.target.value)}>
            {(['Plumbing', 'HVAC'] as const).map((group) => (
              <optgroup key={group} label={group}>
                {OPTIONS.filter((o) => o.group === group).map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-zip`} className="text-sm font-semibold text-white/90">
            ZIP code
          </label>
          <input
            id={`${uid}-zip`}
            className={field}
            value={zip}
            onChange={(e) => {
              setZip(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. 80202"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${uid}-zip-error` : undefined}
          />
          {error && (
            <p id={`${uid}-zip-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-300">
              {error}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${uid}-property`} className="text-sm font-semibold text-white/90">
            Property type
          </label>
          <select id={`${uid}-property`} className={field} value={property} onChange={(e) => setProperty(e.target.value as 'residential' | 'commercial')}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>
      <button type="submit" disabled={busy} aria-busy={busy} className="ui-btn ui-btn-primary mt-5 w-full">
        {busy ? 'Opening request form…' : 'Request Service'}
      </button>
      <p className="mt-3 text-xs leading-relaxed text-white/65">
        You&apos;ll add your address and contact details on the next step.{' '}
        <Link href="/book-service" className="underline underline-offset-2 hover:text-white">
          Start from scratch
        </Link>
      </p>
    </form>
  )
}
