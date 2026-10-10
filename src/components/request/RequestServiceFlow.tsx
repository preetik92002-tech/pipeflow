'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Briefcase, Camera, Check, CheckCircle2, Droplets, Flame, Home, Loader2, Thermometer, Wind, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getStoredAttribution, trackEvent } from '@/lib/analytics/tracker'
import { ALLOWED_TYPES, maxSizeFor } from '@/lib/requests/files'
import { CITIES, MAX_FILES, PROPERTY_TYPES, SERVICES, URGENCY, WINDOWS } from '@/lib/requests/schema'

type Category = 'plumbing' | 'hvac'
type CustomerType = 'homeowner' | 'business'

export interface RequestPrefill {
  customerType?: CustomerType
  category?: Category
  service?: string
  city?: (typeof CITIES)[number]
  urgency?: string
}

interface Form {
  customerType: CustomerType | ''
  category: Category | ''
  service: string
  description: string
  businessName: string
  propertyType: string
  equipment: string
  urgency: string
  city: string
  address: string
  zip: string
  preferredDate: string
  preferredWindow: string
  name: string
  phone: string
  email: string
}

const STEPS = ['who', 'category', 'service', 'details', 'urgency', 'location', 'photos', 'schedule', 'contact'] as const
type Step = (typeof STEPS)[number]

const card = 'flex w-full items-center gap-4 rounded-2xl border-2 border-neutral-200 bg-white p-4 text-left transition hover:border-brand-blue hover:shadow-md focus-visible:outline-2 data-[on=true]:border-brand-blue data-[on=true]:bg-blue-50'
const input = 'w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30'

function Choice({ on, onClick, icon, title, hint }: { on: boolean; onClick: () => void; icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <button type="button" data-on={on} onClick={onClick} className={card} aria-pressed={on}>
      {icon && <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-brand-blue">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-semibold text-navy-800">{title}</span>
        {hint && <span className="block text-sm text-neutral-500">{hint}</span>}
      </span>
      {on && <Check className="h-5 w-5 text-brand-blue" aria-hidden="true" />}
    </button>
  )
}

export function RequestServiceFlow({ prefill = {}, phone }: { prefill?: RequestPrefill; phone?: string }) {
  const [form, setForm] = useState<Form>({
    customerType: prefill.customerType ?? '', category: prefill.category ?? '', service: prefill.service ?? '', description: '',
    businessName: '', propertyType: '', equipment: '', urgency: prefill.urgency ?? '', city: prefill.city ?? '', address: '', zip: '',
    preferredDate: '', preferredWindow: 'any', name: '', phone: '', email: '',
  })
  const firstOpen = useRef(new Date().toISOString())
  const [step, setStep] = useState<Step>(() => (prefill.customerType ? (prefill.category ? (prefill.service ? 'details' : 'service') : 'category') : 'who'))
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ reference: string; attachments: number } | null>(null)
  const [hp, setHp] = useState('')
  const top = useRef<HTMLDivElement>(null)

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))
  const index = STEPS.indexOf(step)
  const services = form.category ? SERVICES[form.category] : []
  const business = form.customerType === 'business'

  useEffect(() => {
    trackEvent('start_booking', { cta_location: 'request_flow' })
  }, [])
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [step, done])

  const go = (s: Step) => {
    setError(null)
    setStep(s)
  }
  const next = () => go(STEPS[Math.min(index + 1, STEPS.length - 1)])
  const back = () => go(STEPS[Math.max(index - 1, 0)])
  const pick = <K extends keyof Form>(key: K, value: Form[K]) => {
    set(key, value)
    setTimeout(() => setStep(STEPS[Math.min(STEPS.indexOf(step) + 1, STEPS.length - 1)]), 120)
  }

  function validate(): string | null {
    switch (step) {
      case 'details':
        if (form.description.trim().length < 10) return 'Tell us a little about the problem or project (at least 10 characters).'
        if (business && !form.businessName.trim()) return 'Enter the business name.'
        return null
      case 'location':
        if (!form.city) return 'Choose Denver or Boulder.'
        if (form.address.trim().length < 3) return 'Enter the service address.'
        if (!/^80\d{3}$/.test(form.zip.trim())) return 'Enter a 5-digit Colorado ZIP code that starts with 80.'
        return null
      case 'contact':
        if (!form.name.trim()) return 'Enter your name.'
        if (!/^[+()\d.\-\s]{7,30}$/.test(form.phone.trim())) return 'Enter a valid phone number.'
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address.'
        return null
      default:
        return null
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...files]
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) { setError(`You can attach up to ${MAX_FILES} files.`); break }
      if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) { setError(`${file.name}: only JPG, PNG, WebP or HEIC photos and MP4 or MOV videos.`); continue }
      if (file.size > maxSizeFor(file.type)) { setError(`${file.name} is too large (photos up to 10 MB, videos up to 50 MB).`); continue }
      next.push(file)
    }
    setFiles(next)
  }

  async function uploadAll(): Promise<string[]> {
    if (!files.length) return []
    const res = await fetch('/api/service-requests/uploads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })) }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || 'Upload failed.')
    const storage = createClient().storage.from('service-requests')
    const paths: string[] = []
    for (let i = 0; i < files.length; i++) {
      const u = body.uploads[i] as { path: string; token: string }
      const { error: upErr } = await storage.uploadToSignedUrl(u.path, u.token, files[i], { contentType: files[i].type })
      if (upErr) throw new Error(`Could not upload ${files[i].name}.`)
      paths.push(u.path)
    }
    return paths
  }

  async function submit() {
    const problem = validate()
    if (problem) return setError(problem)
    setBusy(true)
    setError(null)
    try {
      let attachments: string[] = []
      try {
        attachments = await uploadAll()
      } catch (e) {
        throw new Error(`${e instanceof Error ? e.message : 'Upload failed.'} Remove the files to send the request without them.`)
      }
      const a = getStoredAttribution()
      const res = await fetch('/api/service-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType: form.customerType, category: form.category, service: form.service, description: form.description,
          urgency: form.urgency, city: form.city, address: form.address, zip: form.zip, attachments,
          preferredDate: form.preferredDate, preferredWindow: form.preferredWindow, name: form.name, phone: form.phone, email: form.email,
          business: business ? { name: form.businessName, propertyType: form.propertyType, equipment: form.equipment } : undefined,
          website_url_hp: hp, formOpenedAt: firstOpen.current,
          utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign, utm_term: a.utm_term, utm_content: a.utm_content,
          gclid: a.gclid, fbclid: a.fbclid, referrer: a.referrer, landingPage: a.landing_page,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        if (body.field) {
          const f = String(body.field)
          if (f.startsWith('city') || f.startsWith('address') || f.startsWith('zip')) go('location')
          else if (f.startsWith('description') || f.startsWith('business')) go('details')
        }
        throw new Error(body.error || 'We could not send your request.')
      }
      trackEvent('submit_booking', { service_category: form.category, service_name: form.service, service_area: form.city, zip_code: form.zip })
      setDone({ reference: body.reference ?? '', attachments: body.attachments ?? 0 })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not send your request.')
    } finally {
      setBusy(false)
    }
  }

  const progress = useMemo(() => Math.round(((index + 1) / STEPS.length) * 100), [index])

  if (done) {
    return (
      <div ref={top} className="mx-auto max-w-xl scroll-mt-24 rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl font-bold text-navy-800">Your request is in</h2>
        {done.reference && <p className="mt-1 text-sm text-neutral-500">Reference <span className="font-mono font-semibold text-navy-800">{done.reference}</span></p>}
        <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left text-sm text-neutral-700">
          <li className="flex gap-3"><span className="font-bold text-brand-blue">1</span>We review what you sent{done.attachments ? ` (including ${done.attachments} file${done.attachments > 1 ? 's' : ''})` : ''}.</li>
          <li className="flex gap-3"><span className="font-bold text-brand-blue">2</span>We look for professionals serving {form.city}.</li>
          <li className="flex gap-3"><span className="font-bold text-brand-blue">3</span>You are contacted by phone or email to arrange the appointment.</li>
        </ol>
        {form.urgency === 'emergency' && phone && (
          <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-800">If water is flowing or there is a safety risk, close the main water shutoff and call <a className="font-bold underline" href={`tel:${phone}`}>{phone}</a>. For gas smells, leave the building and call your gas utility or 911.</p>
        )}
        <Link href="/" className="btn-outline mt-8 inline-flex">Back to the home page</Link>
      </div>
    )
  }

  const label = 'mb-1.5 block text-sm font-semibold text-neutral-700'

  return (
    <div ref={top} className="mx-auto max-w-2xl scroll-mt-24">
      <div className="mb-6">
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200" role="progressbar" aria-label="Request progress" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={index + 1} aria-valuetext={`Step ${index + 1} of ${STEPS.length}`}><div className="h-full rounded-full bg-brand-red transition-all duration-500 ease-out-expo motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 text-xs font-semibold text-neutral-500">Step {index + 1} of {STEPS.length}</p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label></div>

        {step === 'who' && (
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-navy-800">Who is this service for?</h2>
            <Choice on={form.customerType === 'homeowner'} onClick={() => pick('customerType', 'homeowner')} icon={<Home className="h-6 w-6" />} title="Homeowner" hint="A house, condo or apartment you live in" />
            <Choice on={form.customerType === 'business'} onClick={() => pick('customerType', 'business')} icon={<Briefcase className="h-6 w-6" />} title="Business" hint="A commercial property, office, shop or rental building" />
          </div>
        )}

        {step === 'category' && (
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-navy-800">What do you need help with?</h2>
            <Choice on={form.category === 'plumbing'} onClick={() => { set('service', ''); pick('category', 'plumbing') }} icon={<Droplets className="h-6 w-6" />} title="Plumbing" hint="Leaks, water heaters, frozen pipes, fixtures" />
            <Choice on={form.category === 'hvac'} onClick={() => { set('service', ''); pick('category', 'hvac') }} icon={<Wind className="h-6 w-6" />} title="HVAC" hint="AC, heating, installation, maintenance" />
          </div>
        )}

        {step === 'service' && (
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-navy-800">Which service?</h2>
            {services.map((s) => (
              <Choice key={s.value} on={form.service === s.value} onClick={() => pick('service', s.value)} icon={form.category === 'plumbing' ? (s.value.includes('heater') ? <Flame className="h-6 w-6" /> : <Droplets className="h-6 w-6" />) : <Thermometer className="h-6 w-6" />} title={s.label} />
            ))}
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy-800">{business ? 'Tell us about the project' : 'Describe the problem'}</h2>
            <button type="button" className="text-sm font-semibold text-brand-blue hover:underline" onClick={() => set('customerType', business ? 'homeowner' : 'business')}>
              {business ? 'This request is for my home' : 'This request is for a business'}
            </button>
            {business && (
              <>
                <div><label className={label} htmlFor="biz">Business name</label><input id="biz" className={input} value={form.businessName} onChange={(e) => set('businessName', e.target.value)} autoComplete="organization" /></div>
                <div>
                  <label className={label} htmlFor="ptype">Property type</label>
                  <select id="ptype" className={input} value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
                    <option value="">Choose one</option>
                    {PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className={label} htmlFor="equip">Equipment or system details (optional)</label><input id="equip" className={input} value={form.equipment} onChange={(e) => set('equipment', e.target.value)} placeholder="Make, model, age, rooftop unit, boiler…" /></div>
              </>
            )}
            <div>
              <label className={label} htmlFor="desc">{business ? 'Project description' : 'What is happening?'}</label>
              <textarea id="desc" rows={5} className={input} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={3000} placeholder="Where is it, what do you see or hear, and when did it start?" />
            </div>
          </div>
        )}

        {step === 'urgency' && (
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-navy-800">How soon do you need help?</h2>
            {URGENCY.map((u) => <Choice key={u.value} on={form.urgency === u.value} onClick={() => pick('urgency', u.value)} title={u.label} hint={u.hint} />)}
          </div>
        )}

        {step === 'location' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy-800">Where is the service needed?</h2>
            <div className="grid grid-cols-2 gap-3">
              {CITIES.map((c) => <Choice key={c} on={form.city === c} onClick={() => set('city', c)} title={c} />)}
            </div>
            <div><label className={label} htmlFor="addr">Street address</label><input id="addr" className={input} value={form.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" /></div>
            <div><label className={label} htmlFor="zip">ZIP code</label><input id="zip" className={input} value={form.zip} onChange={(e) => set('zip', e.target.value)} inputMode="numeric" maxLength={5} autoComplete="postal-code" /></div>
            <p className="text-xs text-neutral-500">We currently match requests in Denver and Boulder.</p>
          </div>
        )}

        {step === 'photos' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy-800">Show us the problem</h2>
            <p className="text-neutral-600">Photos or a short video of the equipment, pipes, thermostat or the problem itself can help a professional understand your request. This step is optional.</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center hover:border-brand-blue">
              <Camera className="h-8 w-8 text-brand-blue" aria-hidden="true" />
              <span className="font-semibold text-navy-800">Add photos or video</span>
              <span className="text-xs text-neutral-500">JPG, PNG, WebP, HEIC, MP4 or MOV. Up to {MAX_FILES} files.</span>
              <input type="file" className="sr-only" multiple accept={ALLOWED_TYPES.join(',')} onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
            </label>
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-xl bg-neutral-100 px-4 py-2 text-sm">
                    <span className="min-w-0 truncate">{f.name} <span className="text-neutral-500">({(f.size / 1048576).toFixed(1)} MB)</span></span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} className="ml-3 rounded p-1 text-neutral-500 hover:bg-neutral-200"><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 'schedule' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy-800">When would you like the appointment?</h2>
            <div><label className={label} htmlFor="date">Preferred date (optional)</label><input id="date" type="date" className={input} value={form.preferredDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => set('preferredDate', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WINDOWS.map((w) => <Choice key={w.value} on={form.preferredWindow === w.value} onClick={() => set('preferredWindow', w.value)} title={w.label} />)}
            </div>
            <p className="text-xs text-neutral-500">The professional confirms the actual time with you.</p>
          </div>
        )}

        {step === 'contact' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-navy-800">How can we reach you?</h2>
            <div><label className={label} htmlFor="name">Name</label><input id="name" className={input} value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /></div>
            <div><label className={label} htmlFor="phone">Phone</label><input id="phone" type="tel" className={input} value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" /></div>
            <div><label className={label} htmlFor="email">Email</label><input id="email" type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" /></div>
            <p className="text-xs text-neutral-500">We use your details only to handle this request.</p>
          </div>
        )}

        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">{error}</p>}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" onClick={back} disabled={index === 0 || busy} className="btn-ghost disabled:invisible"><ArrowLeft className="h-4 w-4" />Back</button>
          {['details', 'location', 'photos', 'schedule'].includes(step) && (
            <button type="button" className="btn-primary !px-6 !py-3" onClick={() => { const p = validate(); if (p) setError(p); else next() }}>
              {step === 'photos' && files.length === 0 ? 'Skip' : 'Continue'}<ArrowRight className="h-4 w-4" />
            </button>
          )}
          {step === 'contact' && (
            <button type="button" className="btn-primary !px-6 !py-3" onClick={() => void submit()} disabled={busy}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : 'Submit request'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
