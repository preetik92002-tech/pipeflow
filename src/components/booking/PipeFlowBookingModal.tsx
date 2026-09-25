'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Droplets,
  Flame,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  Loader2,
  PhoneCall,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider'
import { trackEvent } from '@/lib/analytics/tracker'

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'plumbing' | 'hvac'

type TimeWindow = 'morning' | 'afternoon' | 'evening'

type ContactPref = 'call' | 'text' | 'email'

interface BookingFormData {
  // Step 1
  category: Category | null
  serviceId: string
  serviceName: string
  // Step 2
  zip: string
  city: string
  serviceAreaCovered: boolean | null
  // Step 3
  preferredDate: string
  timeWindow: TimeWindow | null
  // Step 4
  name: string
  phone: string
  email: string
  contactPref: ContactPref | null
  description: string
  // Anti-spam honeypot
  _honeypot: string
}

interface ServiceOption {
  id: string
  name: string
  category: Category
  description: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  initialCategory?: Category
  services: ServiceOption[]
  servicesError: string | null
}

// ─── Progress steps config ────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Schedule' },
  { id: 4, label: 'Contact' },
]

// ─── Time windows ─────────────────────────────────────────────────────────────

const TIME_WINDOWS: { id: TimeWindow; label: string; sub: string; Icon: React.ElementType }[] = [
  { id: 'morning', label: 'Morning', sub: '8 AM – 12 PM', Icon: Sun },
  { id: 'afternoon', label: 'Afternoon', sub: '12 PM – 5 PM', Icon: Sunset },
  { id: 'evening', label: 'Evening', sub: '5 PM – 8 PM', Icon: Moon },
]

// ─── Utility: get attribution from sessionStorage ─────────────────────────────

function getAttribution() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem('pf_attribution')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PipeFlowBookingModal({ isOpen, onClose, initialCategory, services: cmsServices, servicesError }: Props) {
  const { company } = useSiteSettings()
  const [step, setStep] = useState(1)
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [zipChecking, setZipChecking] = useState(false)
  const [submittedData, setSubmittedData] = useState<BookingFormData | null>(null)

  const [form, setForm] = useState<BookingFormData>({
    category: initialCategory ?? null,
    serviceId: '',
    serviceName: '',
    zip: '',
    city: '',
    serviceAreaCovered: null,
    preferredDate: '',
    timeWindow: null,
    name: '',
    phone: '',
    email: '',
    contactPref: null,
    description: '',
    _honeypot: '',
  })

  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // ─── Reset on open ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep(initialCategory ? 1 : 1)
      setIsSuccess(false)
      setSubmitError(null)
      setIsAnimating(false)
      setForm((f) => ({ ...f, category: initialCategory ?? null }))
      trackEvent('booking_modal_open', {})
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialCategory])

  // ─── Escape key ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // ─── Focus trap ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    modal.addEventListener('keydown', trap)
    first?.focus()
    return () => modal.removeEventListener('keydown', trap)
  }, [isOpen, step])

  // ─── URL deep-link: ?book=1 ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('book') === '1' && !isOpen) {
      // Caller should handle opening; this is managed by BookingModalProvider
    }
  }, [isOpen])

  // ─── Animated step transition ────────────────────────────────────────────
  const goToStep = useCallback(
    (next: number, dir: 'forward' | 'back') => {
      if (isAnimating) return
      setAnimDir(dir)
      setIsAnimating(true)
      setTimeout(() => {
        setStep(next)
        setIsAnimating(false)
      }, 220)
    },
    [isAnimating]
  )

  const nextStep = useCallback(() => {
    if (step < 4) goToStep(step + 1, 'forward')
  }, [step, goToStep])

  const prevStep = useCallback(() => {
    if (step > 1) goToStep(step - 1, 'back')
  }, [step, goToStep])

  // ─── ZIP / service area check ─────────────────────────────────────────────
  const checkServiceArea = async (zip: string) => {
    if (!zip || zip.length !== 5) return
    setZipChecking(true)
    try {
      const res = await fetch(`/api/service-areas/check?zip=${encodeURIComponent(zip)}`)
      const data = await res.json()
      setForm((f) => ({
        ...f,
        serviceAreaCovered: !!data.covered,
        city: data.city || '',
      }))
      trackEvent('service_area_search', { zip, covered: !!data.covered })
    } catch {
      setForm((f) => ({ ...f, serviceAreaCovered: false }))
    } finally {
      setZipChecking(false)
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (form._honeypot) return // Bot detected
    setIsSubmitting(true)
    setSubmitError(null)
    const attribution = getAttribution()
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...attribution }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Submission failed. Please try again.')
      }
      setSubmittedData(form)
      setIsSuccess(true)
      trackEvent('submit_booking', {
        category: form.category,
        service: form.serviceName,
        zip: form.zip,
      })
      // Fire Google Ads conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'conversion', {
          send_to: process.env.NEXT_PUBLIC_GADS_CONVERSION_ID,
        })
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please call us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Validation per step ─────────────────────────────────────────────────
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!form.category && !!form.serviceId
      case 2:
        return form.zip.length === 5 && form.serviceAreaCovered !== null
      case 3:
        return !!form.preferredDate && !!form.timeWindow
      case 4:
        return (
          form.name.trim().length >= 2 &&
          form.phone.replace(/\D/g, '').length === 10 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
          !!form.contactPref
        )
      default:
        return false
    }
  }

  const updateForm = (patch: Partial<BookingFormData>) =>
    setForm((f) => ({ ...f, ...patch }))

  if (!isOpen) return null

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-[rgba(3,10,20,0.70)] backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className={cn(
          'fixed z-50 inset-0 flex items-center justify-center p-0 sm:p-4',
          'pointer-events-none'
        )}
      >
        <div
          className={cn(
            'relative pointer-events-auto',
            'w-full h-full sm:h-auto',
            'sm:max-w-[680px] lg:max-w-[780px]',
            'sm:max-h-[90vh]',
            'bg-white sm:rounded-2xl shadow-2xl',
            'flex flex-col overflow-hidden',
            'animate-modal-in'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 bg-navy-900 border-b border-navy-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo.png"
                alt="PipeFlow Co."
                width={130}
                height={46}
                className="h-auto w-[110px] sm:w-[130px] object-contain brightness-[1.15]"
              />
              <div className="hidden sm:block h-5 w-px bg-white/20" />
              <span className="hidden sm:block text-xs font-semibold text-white/60 uppercase tracking-wider">
                Book a Service
              </span>
            </div>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              aria-label="Close booking modal"
              className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Progress Bar ── */}
          {!isSuccess && (
            <div className="flex-shrink-0 bg-white border-b border-neutral-100">
              <div className="flex">
                {STEPS.map((s) => (
                  <div key={s.id} className="flex-1 relative">
                    <div
                      className={cn(
                        'h-0.5 absolute top-0 left-0 right-0 transition-all duration-500',
                        step >= s.id ? 'bg-brand-blue' : 'bg-neutral-200'
                      )}
                    />
                    <div
                      className={cn(
                        'flex flex-col items-center pt-3 pb-2 text-center transition-all duration-300',
                        step === s.id
                          ? 'text-brand-blue'
                          : step > s.id
                          ? 'text-emerald-600'
                          : 'text-neutral-400'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-6 h-6 rounded-full text-2xs font-bold mb-0.5',
                          step === s.id
                            ? 'bg-brand-blue text-white'
                            : step > s.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-neutral-200 text-neutral-400'
                        )}
                      >
                        {step > s.id ? '✓' : `0${s.id}`}
                      </span>
                      <span className="text-2xs font-semibold tracking-wide uppercase hidden sm:block">
                        {s.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div
              className={cn(
                'transition-all duration-200',
                isAnimating && animDir === 'forward' && 'opacity-0 translate-x-4',
                isAnimating && animDir === 'back' && 'opacity-0 -translate-x-4',
                !isAnimating && 'opacity-100 translate-x-0'
              )}
            >
              {isSuccess ? (
                <SuccessScreen data={submittedData} onClose={onClose} />
              ) : (
                <>
                  {step === 1 && <Step1Service form={form} updateForm={updateForm} services={cmsServices} servicesError={servicesError} />}
                  {step === 2 && (
                    <Step2Location
                      form={form}
                      updateForm={updateForm}
                      onCheckZip={checkServiceArea}
                      zipChecking={zipChecking}
                    />
                  )}
                  {step === 3 && <Step3Schedule form={form} updateForm={updateForm} />}
                  {step === 4 && (
                    <Step4Contact
                      form={form}
                      updateForm={updateForm}
                      submitError={submitError}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Footer navigation ── */}
          {!isSuccess && (
            <div className="flex-shrink-0 border-t border-neutral-100 px-5 sm:px-7 py-4 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {step > 1 ? (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-navy-900 transition-colors px-3 py-2 rounded-lg hover:bg-neutral-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <a
                    href={`tel:${company.phone.replace(/\D/g, '')}`}
                    className="text-xs text-neutral-400 hover:text-brand-blue transition-colors flex items-center gap-1.5"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Need help now? Call PipeFlow</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3">
                {step < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
                      canProceed()
                        ? 'bg-brand-red text-white hover:bg-brand-red-dark shadow-md hover:-translate-y-0.5'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    )}
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
                      canProceed() && !isSubmitting
                        ? 'bg-brand-red text-white hover:bg-brand-red-dark shadow-md hover:-translate-y-0.5'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Request Service
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Step 1: Service Selection ────────────────────────────────────────────────

function Step1Service({
  form,
  updateForm,
  services: cmsServices,
  servicesError,
}: {
  form: BookingFormData
  updateForm: (p: Partial<BookingFormData>) => void
  services: ServiceOption[]
  servicesError: string | null
}) {
  const services = cmsServices.filter((service) => !form.category || service.category === form.category)

  const selectCategory = (cat: Category) => {
    updateForm({ category: cat, serviceId: '', serviceName: '' })
    trackEvent('booking_category_selected', { category: cat })
  }

  const selectService = (s: ServiceOption) => {
    updateForm({ serviceId: s.id, serviceName: s.name })
    trackEvent('booking_service_selected', { service: s.name })
  }

  return (
    <div className="p-5 sm:p-7 space-y-6">
      <div>
        <h2 id="booking-modal-title" className="text-xl sm:text-2xl font-display font-bold text-navy-900">
          What do you need help with?
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Select a trade category and the specific service you need.
        </p>
      </div>

      {/* Category selector */}
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { id: 'plumbing', label: 'Plumbing', Icon: Droplets, desc: 'Pipes, drains, water heaters & more', color: 'blue' },
            { id: 'hvac', label: 'HVAC', Icon: Flame, desc: 'Heating, cooling, air quality', color: 'red' },
          ] as const
        ).map(({ id, label, Icon, desc, color }) => (
          <button
            key={id}
            onClick={() => selectCategory(id)}
            className={cn(
              'flex flex-col items-start gap-2 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200',
              form.category === id
                ? color === 'blue'
                  ? 'border-brand-blue bg-blue-50 shadow-md'
                  : 'border-brand-red bg-red-50 shadow-md'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
            )}
            aria-pressed={form.category === id}
          >
            <div
              className={cn(
                'p-2.5 rounded-xl',
                form.category === id
                  ? color === 'blue'
                    ? 'bg-brand-blue text-white'
                    : 'bg-brand-red text-white'
                  : 'bg-neutral-100 text-neutral-500'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-navy-900 text-sm sm:text-base">{label}</div>
              <div className="text-2xs text-neutral-500 mt-0.5">{desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Service list */}
      {form.category && (
        <div className="space-y-2">
          {servicesError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{servicesError}</p>}
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Select a service
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => selectService(s)}
                className={cn(
                  'flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all',
                  form.serviceId === s.id
                    ? 'border-brand-blue bg-blue-50 text-brand-blue shadow-sm'
                    : 'border-neutral-200 text-navy-800 hover:border-brand-blue/40 hover:bg-blue-50/40'
                )}
                aria-pressed={form.serviceId === s.id}
              >
                <span>{s.name}</span>
                {form.serviceId === s.id && <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
              </button>
            ))}
            {!services.length && !servicesError && <p className="col-span-full rounded-xl bg-neutral-50 p-3 text-sm text-neutral-500">No active services are available for this category.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 2: Location ─────────────────────────────────────────────────────────

function Step2Location({
  form,
  updateForm,
  onCheckZip,
  zipChecking,
}: {
  form: BookingFormData
  updateForm: (p: Partial<BookingFormData>) => void
  onCheckZip: (zip: string) => void
  zipChecking: boolean
}) {
  const { company } = useSiteSettings()
  const handleZipChange = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 5)
    updateForm({ zip: clean, serviceAreaCovered: null, city: '' })
    if (clean.length === 5) onCheckZip(clean)
  }

  return (
    <div className="p-5 sm:p-7 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-navy-900">
          Where is the property?
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Enter your ZIP code to confirm we serve your area.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
            ZIP Code
          </span>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              inputMode="numeric"
              value={form.zip}
              onChange={(e) => handleZipChange(e.target.value)}
              placeholder="80202"
              maxLength={5}
              className={cn(
                'w-full pl-10 pr-4 py-3 text-sm border rounded-xl outline-none transition-all',
                'border-neutral-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20',
                form.serviceAreaCovered === false && 'border-amber-400'
              )}
            />
            {zipChecking && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-blue animate-spin" />
            )}
          </div>
        </label>

        {/* Coverage result */}
        {form.serviceAreaCovered === true && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Great news!</span> We service{' '}
              {form.city || form.zip}. A technician can be dispatched to your area.
            </div>
          </div>
        )}

        {form.serviceAreaCovered === false && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Outside our current service area.</span> We don&apos;t
              currently cover ZIP {form.zip}. You can still submit a request — we&apos;ll contact
              you if coverage expands, or you can{' '}
              <a
                    href={`tel:${company.phone.replace(/\D/g, '')}`}
                className="underline font-semibold"
              >
                call us directly
              </a>
              .
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
            City / Neighborhood <span className="text-neutral-400 font-normal">(optional)</span>
          </span>
          <input
            type="text"
            value={form.city}
            onChange={(e) => updateForm({ city: e.target.value })}
            placeholder="Denver, Lakewood, Aurora…"
            className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
          />
        </label>
      </div>
    </div>
  )
}

// ─── Step 3: Schedule ─────────────────────────────────────────────────────────

function Step3Schedule({
  form,
  updateForm,
}: {
  form: BookingFormData
  updateForm: (p: Partial<BookingFormData>) => void
}) {
  const { company } = useSiteSettings()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-5 sm:p-7 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-navy-900">
          When works best for you?
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          This is your preferred window — not a confirmed appointment. We&apos;ll confirm availability by phone.
        </p>
      </div>

      <div>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
            Preferred Date
          </span>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              min={today}
              value={form.preferredDate}
              onChange={(e) => updateForm({ preferredDate: e.target.value })}
              className="w-full pl-10 pr-4 py-3 text-sm border border-neutral-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
            />
          </div>
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
          Preferred Time Window
        </span>
        <div className="grid grid-cols-3 gap-3">
          {TIME_WINDOWS.map(({ id, label, sub, Icon }) => (
            <button
              key={id}
              onClick={() => updateForm({ timeWindow: id })}
              aria-pressed={form.timeWindow === id}
              className={cn(
                'flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 text-center transition-all duration-200',
                form.timeWindow === id
                  ? 'border-brand-blue bg-blue-50 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  form.timeWindow === id ? 'text-brand-blue' : 'text-neutral-400'
                )}
              />
              <div
                className={cn(
                  'text-sm font-bold',
                  form.timeWindow === id ? 'text-brand-blue' : 'text-navy-800'
                )}
              >
                {label}
              </div>
              <div className="text-2xs text-neutral-500">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
        <Clock className="h-4 w-4 text-brand-blue flex-shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-600">
          For <span className="font-semibold text-brand-red">same-day emergency service</span>, skip
          scheduling and call us directly at{' '}
          <a
            href={`tel:${company.phone.replace(/\D/g, '')}`}
            className="font-bold text-brand-blue underline"
          >
            {company.phone}
          </a>
          .
        </p>
      </div>
    </div>
  )
}

// ─── Step 4: Contact ──────────────────────────────────────────────────────────

function Step4Contact({
  form,
  updateForm,
  submitError,
}: {
  form: BookingFormData
  updateForm: (p: Partial<BookingFormData>) => void
  submitError: string | null
}) {
  const CONTACT_PREFS: { id: ContactPref; label: string; Icon: React.ElementType }[] = [
    { id: 'call', label: 'Call', Icon: Phone },
    { id: 'text', label: 'Text', Icon: MessageSquare },
    { id: 'email', label: 'Email', Icon: Mail },
  ]

  return (
    <div className="p-5 sm:p-7 space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-navy-900">
          Your contact information
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          We&apos;ll reach out to confirm your appointment within 1 business hour.
        </p>
      </div>

      {/* Review summary */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-1.5 text-xs">
        <p className="font-semibold text-neutral-700 uppercase tracking-wider text-2xs mb-2">
          Your Request Summary
        </p>
        <div className="flex items-center gap-2 text-neutral-600">
          {form.category === 'plumbing' ? (
            <Droplets className="h-3.5 w-3.5 text-brand-blue flex-shrink-0" />
          ) : (
            <Flame className="h-3.5 w-3.5 text-brand-red flex-shrink-0" />
          )}
          <span>
            {form.serviceName} &mdash;{' '}
            <span className="capitalize">{form.category}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
          <span>
            {form.city ? `${form.city}, ` : ''}ZIP {form.zip}
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <Calendar className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
          <span>
            {form.preferredDate}{' '}
            <span className="capitalize">({form.timeWindow})</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Name */}
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
            Full Name
          </span>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="Jane Smith"
              autoComplete="name"
              className="w-full pl-10 pr-4 py-3 text-sm border border-neutral-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
            />
          </div>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phone */}
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
              Phone
            </span>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  const formatted =
                    digits.length > 6
                      ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
                      : digits.length > 3
                      ? `(${digits.slice(0, 3)}) ${digits.slice(3)}`
                      : digits
                  updateForm({ phone: formatted })
                }}
                placeholder="(720) 555-0100"
                autoComplete="tel"
                className="w-full pl-10 pr-4 py-3 text-sm border border-neutral-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>
          </label>

          {/* Email */}
          <label className="block">
            <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
              Email
            </span>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                placeholder="jane@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 text-sm border border-neutral-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>
          </label>
        </div>

        {/* Contact preference */}
        <div>
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
            Best Way to Reach You
          </span>
          <div className="flex gap-2">
            {CONTACT_PREFS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => updateForm({ contactPref: id })}
                aria-pressed={form.contactPref === id}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all',
                  form.contactPref === id
                    ? 'border-brand-blue bg-brand-blue text-white shadow-sm'
                    : 'border-neutral-200 text-neutral-600 hover:border-brand-blue/40 hover:bg-blue-50/40'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <label className="block">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5 block">
            Describe the Issue{' '}
            <span className="text-neutral-400 font-normal">(optional)</span>
          </span>
          <textarea
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="Any additional details that might help our technician prepare…"
            rows={3}
            className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all resize-none"
          />
        </label>
      </div>

      {/* Anti-spam honeypot — hidden from real users */}
      <input
        type="text"
        name="_honeypot"
        value={form._honeypot}
        onChange={(e) => updateForm({ _honeypot: e.target.value })}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />

      {/* Submit error */}
      {submitError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Error: </span>
            {submitError}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  data,
  onClose,
}: {
  data: BookingFormData | null
  onClose: () => void
}) {
  const { company } = useSiteSettings()
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center min-h-[380px]">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
        <CheckCircle2 className="h-9 w-9 text-emerald-500" />
      </div>

      <Image
        src="/assets/logo.png"
        alt="PipeFlow Co."
        width={120}
        height={43}
        className="h-auto w-[90px] object-contain mb-4 opacity-60"
      />

      <h2 className="text-2xl font-display font-bold text-navy-900 mb-2">
        Service Request Received!
      </h2>
      <p className="text-sm text-neutral-500 max-w-sm mb-6">
        Thank you, {data?.name?.split(' ')[0] || 'there'}! Our team will contact you at{' '}
        <span className="font-semibold text-navy-700">{data?.phone}</span> within 1 business hour
        to confirm your{' '}
        <span className="font-semibold">{data?.serviceName}</span> appointment.
      </p>

      {data && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left w-full max-w-sm space-y-2 text-xs text-neutral-600 mb-6">
          <p>
            <span className="font-semibold">Service:</span> {data.serviceName}
          </p>
          <p>
            <span className="font-semibold">Location:</span>{' '}
            {data.city ? `${data.city}, ` : ''}ZIP {data.zip}
          </p>
          <p>
            <span className="font-semibold">Preferred:</span>{' '}
            {data.preferredDate} ({data.timeWindow})
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-navy-700 transition-colors"
        >
          Done
        </button>
        <a
          href={`tel:${company.phone.replace(/\D/g, '')}`}
          className="flex-1 px-6 py-3 rounded-xl border-2 border-navy-900 text-navy-900 font-bold text-sm hover:bg-navy-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <PhoneCall className="h-4 w-4" />
          Call PipeFlow
        </a>
      </div>
    </div>
  )
}

export default PipeFlowBookingModal
