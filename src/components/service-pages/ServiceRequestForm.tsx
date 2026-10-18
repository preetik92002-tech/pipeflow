'use client'

import { useId, useState, type FormEvent } from 'react'
import { SERVICES, ZIP_ERROR, isServiceZip } from '@/lib/requests/schema'
import styles from './servicePage.module.css'

const OPTIONS = (['plumbing', 'hvac'] as const).flatMap((category) =>
  SERVICES[category].map((s) => ({ key: `${category}:${s.value}`, label: s.label, group: category === 'plumbing' ? 'Plumbing' : 'HVAC' }))
)

/**
 * Compact request form for the service pages. It checks the ZIP with the shared rule and opens the real
 * request flow (/book-service) with the service, ZIP and property type filled in. Nothing is saved here.
 */
export function ServiceRequestForm({ defaultService, defaultLabel = '', heading = 'Request Service', disclosure }: { defaultService: string; defaultLabel?: string; heading?: string; disclosure: string }) {
  const uid = useId()
  const [service, setService] = useState(OPTIONS.some((o) => o.key === defaultService) ? defaultService : OPTIONS[0].key)
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
    setTimeout(() => setBusy(false), 8000)
  }

  return (
    <form id="request" onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`} className={styles.form}>
      <h2 id={`${uid}-title`}>{heading}</h2>
      <label htmlFor={`${uid}-service`}>Service needed</label>
      <select id={`${uid}-service`} value={service} onChange={(e) => setService(e.target.value)}>
        {(['Plumbing', 'HVAC'] as const).map((group) => (
          <optgroup key={group} label={group}>
            {OPTIONS.filter((o) => o.group === group).map((o) => (
              <option key={o.key} value={o.key}>
                {o.key === defaultService && defaultLabel ? defaultLabel : o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <label htmlFor={`${uid}-zip`}>ZIP code</label>
      <input
        id={`${uid}-zip`}
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
        <p id={`${uid}-zip-error`} role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <label htmlFor={`${uid}-property`}>Property type</label>
      <select id={`${uid}-property`} value={property} onChange={(e) => setProperty(e.target.value as 'residential' | 'commercial')}>
        <option value="residential">Residential</option>
        <option value="commercial">Commercial</option>
      </select>
      <button type="submit" disabled={busy} aria-busy={busy} className={styles.submit}>
        {busy ? 'Opening request form…' : 'Request Service'}
      </button>
      <p className={styles.fine}>{disclosure}</p>
      <p className={styles.fine}>You&apos;ll add your address and contact details on the next step.</p>
    </form>
  )
}
