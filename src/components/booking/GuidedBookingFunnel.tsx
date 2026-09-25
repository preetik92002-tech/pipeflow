'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Droplets,
  Wind,
  Wrench,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider'
import { getStoredAttribution, trackEvent } from '@/lib/analytics/tracker'
import type { Service } from '@/types'

interface GuidedBookingFunnelProps {
  initialService?: string
  initialCategory?: string
  initialArea?: string
  services: Service[]
}

export function GuidedBookingFunnel({
  initialService,
  initialCategory = 'plumbing',
  initialArea,
  services,
}: GuidedBookingFunnelProps) {
  const { company } = useSiteSettings()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formOpenedAt] = useState(() => new Date().toISOString())

  // Booking Data State
  const [category, setCategory] = useState<'plumbing' | 'hvac'>(
    initialCategory === 'hvac' ? 'hvac' : 'plumbing'
  )
  const [serviceSlug, setServiceSlug] = useState<string>(
    initialService || (initialCategory === 'hvac' ? 'ac-repair' : 'leak-repair')
  )
  const [problemDescription, setProblemDescription] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)
  const [address, setAddress] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('morning')
  const [honeypot, setHoneypot] = useState('')

  useEffect(() => {
    trackEvent('start_booking', {
      service_category: category,
      service_name: serviceSlug,
    })
  }, [category, serviceSlug])

  const availableServices = services.filter((s) => s.category === category)
  const selectedServiceObj = services.find((s) => s.slug === serviceSlug)

  const handleNextStep = () => {
    setErrorMessage(null)
    if (step === 3 && isEmergency) {
      // Allow fast track
    }
    if (step === 4 && (!zipCode || !/^\d{5}$/.test(zipCode.trim()))) {
      setErrorMessage('Please enter a valid 5-digit Colorado ZIP code.')
      return
    }
    if (step === 5) {
      if (!name.trim() || !phone.trim() || phone.trim().length < 10) {
        setErrorMessage('Please enter your full name and a valid 10-digit phone number.')
        return
      }
    }
    setStep((s) => Math.min(s + 1, 6))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const attribution = getStoredAttribution()
      const payload = {
        name,
        phone,
        email,
        serviceCategory: category,
        specificService: serviceSlug,
        address,
        zipCode,
        preferredDate,
        preferredTime,
        problemDescription,
        isEmergency,
        website_url_hp: honeypot, // Honeypot field
        formOpenedAt,
        ...attribution,
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking inquiry.')
      }

      trackEvent('submit_booking', {
        service_category: category,
        service_name: serviceSlug,
        zip_code: zipCode,
      })

      setBookingConfirmed(data.bookingId || 'BK-SUCCESS')
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error submitting booking request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirmation View
  if (bookingConfirmed) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border border-green-200">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <span className="text-2xs font-mono uppercase bg-neutral-100 px-3 py-1 rounded-full text-neutral-600">
          Reference: {bookingConfirmed}
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mt-3 mb-2">
          Service Window Requested!
        </h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
          Thank you, <strong>{name}</strong>. A PipeFlow Colorado service coordinator is reviewing
          your requested window for <strong>{selectedServiceObj?.title || serviceSlug}</strong>. We
          will call you shortly at <strong>{phone}</strong> to confirm technician arrival.
        </p>

        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left text-xs text-neutral-700 mb-6 space-y-1">
          <p className="font-bold text-navy-900 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-blue" />
            Dispatch Window Status:
          </p>
          <p>
            Your request has been routed to our Denver metro dispatch fleet. Technicians provide a 30-minute advance arrival call before reaching your address.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary !py-2.5 !px-6 text-xs">
            Return to Homepage
          </Link>
          <a
            href={`tel:${company.phone}`}
            className="btn-outline !py-2.5 !px-6 text-xs inline-flex items-center gap-1.5"
          >
            <Phone className="h-3.5 w-3.5 text-brand-red" />
            Call Dispatch: {company.phone}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-2xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
          <span>Step {step} of 6</span>
          <span>
            {step === 1 && 'Trade Category'}
            {step === 2 && 'Specific Service'}
            {step === 3 && 'Problem Details'}
            {step === 4 && 'Colorado Location'}
            {step === 5 && 'Contact Info'}
            {step === 6 && 'Time Window'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
          <div
            className="h-full bg-brand-blue transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Honeypot field (hidden from real users, filled by bots) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url_hp">Leave empty</label>
        <input
          id="website_url_hp"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Card Body */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl p-6 sm:p-10">
        {/* STEP 1: CATEGORY */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900 mb-1">
                Select Your Service Category
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                What residential system requires attention in your home today?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setCategory('plumbing')
                  setServiceSlug('leak-repair')
                }}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === 'plumbing'
                    ? 'border-brand-blue bg-blue-50/70 shadow-sm ring-2 ring-brand-blue/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center mb-4">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-base mb-1">Plumbing</h3>
                  <p className="text-xs text-neutral-600 leading-snug">
                    Leaks, drains, water heaters, pipe ruptures, faucets, and sewer issues.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('hvac')
                  setServiceSlug('ac-repair')
                }}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === 'hvac'
                    ? 'border-orange-500 bg-orange-50/70 shadow-sm ring-2 ring-orange-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  <Wind className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-base mb-1">HVAC (Heating &amp; Cooling)</h3>
                  <p className="text-xs text-neutral-600 leading-snug">
                    Furnaces, air conditioning, heat pumps, humidifiers, and tune-ups.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SPECIFIC SERVICE */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900 mb-1">
                Choose Specific Service
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                Select the option that best matches your immediate need:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {availableServices.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setServiceSlug(svc.slug)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    serviceSlug === svc.slug
                      ? 'border-brand-blue bg-blue-50/80 font-bold text-navy-900 ring-1 ring-brand-blue'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                  }`}
                >
                  <p className="text-sm">{svc.title}</p>
                  <p className="text-2xs text-neutral-500 font-normal line-clamp-1 mt-0.5">
                    {svc.shortDescription}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PROBLEM DETAILS & EMERGENCY */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900 mb-1">
                Tell Us What’s Going On
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                Brief details help our dispatcher assign the technician with the exact truck equipment.
              </p>
            </div>

            <div className="rounded-2xl bg-red-50/80 border border-red-200 p-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red"
                />
                <div>
                  <span className="text-sm font-bold text-navy-900 block">
                    🚨 Active Emergency (Flooding, Burst Pipe, No Heat in Freeze)
                  </span>
                  <span className="text-2xs text-neutral-600">
                    Checking this flags your request for immediate Denver dispatch.
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label htmlFor="probDesc" className="form-label font-bold text-navy-900">
                Description of the Issue
              </label>
              <textarea
                id="probDesc"
                rows={4}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="e.g. Water heater is leaking at the base, pilot light won't stay lit, or strange rumbling sound..."
                className="form-input resize-none text-sm"
              />
            </div>
          </div>
        )}

        {/* STEP 4: COLORADO LOCATION */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900 mb-1">
                Where Is the Property Located?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                We provide prompt dispatch across Denver and surrounding Colorado communities.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="bookZip" className="form-label font-bold text-navy-900">
                  5-Digit Colorado ZIP Code <span className="text-brand-red">*</span>
                </label>
                <input
                  id="bookZip"
                  type="text"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="e.g. 80202"
                  className="form-input text-sm font-mono"
                />
              </div>

              <div>
                <label htmlFor="bookAddress" className="form-label font-bold text-navy-900">
                  Street Address <span className="text-neutral-400 font-normal">(optional at this step)</span>
                </label>
                <input
                  id="bookAddress"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 1420 Main St, Denver, CO"
                  className="form-input text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONTACT INFORMATION */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900 mb-1">
                Your Contact Information
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                Who should our service coordinator call to confirm the arrival window?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="bookName" className="form-label font-bold text-navy-900">
                  Full Name <span className="text-brand-red">*</span>
                </label>
                <input
                  id="bookName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Michael Miller"
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label htmlFor="bookPhone" className="form-label font-bold text-navy-900">
                  Phone Number <span className="text-brand-red">*</span>
                </label>
                <input
                  id="bookPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(720) 555-0199"
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label htmlFor="bookEmail" className="form-label font-bold text-navy-900">
                  Email Address <span className="text-neutral-400 font-normal">(for appointment confirmation)</span>
                </label>
                <input
                  id="bookEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="michael@example.com"
                  className="form-input text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: PREFERRED DATE & TIME */}
        {step === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-900 mb-1">
                Requested Arrival Window
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                Please note: At the MVP stage this records your <em>requested</em> time. A coordinator confirms final dispatch.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="bookDate" className="form-label font-bold text-navy-900">
                  Preferred Date
                </label>
                <input
                  id="bookDate"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div>
                <label htmlFor="bookTime" className="form-label font-bold text-navy-900">
                  Preferred Arrival Window
                </label>
                <select
                  id="bookTime"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="morning">Morning (8:00 AM – 12:00 PM)</option>
                  <option value="afternoon">Afternoon (12:00 PM – 4:00 PM)</option>
                  <option value="evening">Late Afternoon (4:00 PM – 7:00 PM)</option>
                  <option value="first-available">First Available On-Duty Route</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1">
                <p className="font-bold text-navy-900">Summary of Request:</p>
                <p>&bull; Service: {selectedServiceObj?.title || serviceSlug} ({category.toUpperCase()})</p>
                <p>&bull; Location: {address ? `${address}, ` : ''}{zipCode}, CO</p>
                <p>&bull; Contact: {name} &bull; {phone}</p>
                {isEmergency && <p className="text-brand-red font-bold">&bull; Flagged for 24/7 Priority Emergency Dispatch</p>}
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-neutral-100 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(s - 1, 1))}
              className="btn-outline !py-2.5 !px-5 text-xs inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-1.5"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary !py-3 !px-8 text-sm inline-flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm &amp; Request Appointment
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
