'use client'

import { useState } from 'react'
import {
  HardHat,
  Send,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  ShieldCheck,
  Award,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracker'

export function ProApplicationForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formOpenedAt] = useState(() => new Date().toISOString())

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [trade, setTrade] = useState<'plumbing' | 'hvac' | 'both'>('plumbing')
  const [experience, setExperience] = useState('2-5 years')
  const [licenseInfo, setLicenseInfo] = useState('')
  const [insuranceInfo, setInsuranceInfo] = useState('')
  const [website, setWebsite] = useState('')
  const [message, setMessage] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    'Denver',
    'Aurora',
    'Lakewood',
  ])
  const [docName, setDocName] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be under 10MB')
        return
      }
      setDocName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Please fill in your name, phone number, and email address.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name,
        company,
        phone,
        email,
        trade,
        experience,
        serviceAreas: selectedAreas,
        licenseInfo,
        insuranceInfo,
        website,
        message,
        documentName: docName,
        website_url_hp: honeypot,
        formOpenedAt,
      }

      const res = await fetch('/api/pro-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit pro application.')
      }

      trackEvent('pro_application_submit', { trade })
      setSubmitted(true)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error submitting application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 text-center shadow-xl animate-fade-in max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border border-green-200">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-navy-900 mb-2">
          Application Submitted!
        </h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
          Thank you, <strong>{name}</strong>. Your professional trade inquiry has been received by
          PipeFlow Contractor Relations. Our onboarding team reviews qualifications and will reach
          out to discuss route opportunities.
        </p>
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 text-left mb-6 space-y-1">
          <p className="font-bold text-navy-900">Application Review Process:</p>
          <p>&bull; Status: <strong>New / Under Review</strong></p>
          <p>&bull; We verify state licensing and active insurance status.</p>
          <p>&bull; We schedule an interview with our technical trade leads.</p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-xl space-y-6"
    >
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="hp_pro">Leave blank</label>
        <input
          id="hp_pro"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="border-b border-neutral-100 pb-4">
        <h3 className="text-xl font-bold font-display text-navy-900">Trade Partner Application</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Join our network of licensed Colorado plumbers, HVAC mechanics, and service contractors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label font-bold text-navy-900 text-xs">
            Full Name <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Henderson"
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="form-label font-bold text-navy-900 text-xs">
            Company / Business Name <span className="text-neutral-400 font-normal">(if independent LLC)</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Henderson Mechanical LLC"
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="form-label font-bold text-navy-900 text-xs">
            Phone Number <span className="text-brand-red">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(720) 555-0144"
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="form-label font-bold text-navy-900 text-xs">
            Email Address <span className="text-brand-red">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="form-label font-bold text-navy-900 text-xs">
            Primary Trade <span className="text-brand-red">*</span>
          </label>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value as 'plumbing' | 'hvac' | 'both')}
            className="form-input text-xs"
          >
            <option value="plumbing">Plumbing Services</option>
            <option value="hvac">HVAC / Mechanical</option>
            <option value="both">Both (Dual-Licensed)</option>
          </select>
        </div>

        <div>
          <label className="form-label font-bold text-navy-900 text-xs">Years of Field Experience</label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="form-input text-xs"
          >
            <option value="1-2 years">1 – 2 Years (Apprentice / Junior)</option>
            <option value="2-5 years">2 – 5 Years (Journeyman)</option>
            <option value="5-10 years">5 – 10 Years (Senior Tradesperson)</option>
            <option value="10+ years">10+ Years (Master / Lead Contractor)</option>
          </select>
        </div>

        <div>
          <label className="form-label font-bold text-navy-900 text-xs">
            Colorado License # <span className="text-neutral-400 font-normal">(Master / Journeyman)</span>
          </label>
          <input
            type="text"
            value={licenseInfo}
            onChange={(e) => setLicenseInfo(e.target.value)}
            placeholder="e.g. CO-PLM-123456"
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="form-label font-bold text-navy-900 text-xs">
            Insurance Information <span className="text-neutral-400 font-normal">(General Liability / GL)</span>
          </label>
          <input
            type="text"
            value={insuranceInfo}
            onChange={(e) => setInsuranceInfo(e.target.value)}
            placeholder="e.g. Policy # or Provider Name"
            className="form-input text-xs"
          />
        </div>
      </div>

      {/* Preferred Service Territories */}
      <div>
        <label className="form-label font-bold text-navy-900 text-xs block mb-2">
          Preferred Service Route Counties / Cities
        </label>
        <div className="flex flex-wrap gap-2">
          {['Denver', 'Aurora', 'Lakewood', 'Littleton', 'Arvada', 'Thornton', 'Centennial', 'Parker', 'Castle Rock'].map(
            (city) => (
              <button
                key={city}
                type="button"
                onClick={() => toggleArea(city)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  selectedAreas.includes(city)
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {city}
              </button>
            )
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="form-label font-bold text-navy-900 text-xs">
          About Your Experience &amp; Equipment
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your background, certifications, truck/tools setup, or availability..."
          className="form-input text-xs resize-none"
        />
      </div>

      {/* Document Upload */}
      <div>
        <span className="form-label font-bold text-navy-900 text-xs block mb-1">
          Upload Resume, License Copy, or Certificates (PDF, DOCX, JPG up to 10MB)
        </span>
        {docName ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 inline-flex text-xs">
            <span className="font-semibold text-navy-900">{docName}</span>
            <button
              type="button"
              onClick={() => setDocName(null)}
              className="text-brand-red text-2xs hover:underline flex items-center gap-0.5"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-neutral-300 hover:border-brand-blue rounded-xl p-4 text-center cursor-pointer block transition-colors bg-neutral-50/50 text-xs">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleDocUpload}
              className="hidden"
            />
            <Upload className="h-5 w-5 text-neutral-400 mx-auto mb-1" />
            <span className="text-neutral-600 font-medium">Click to select resume or license document</span>
          </label>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full !py-3.5 text-sm shadow-md disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Submitting Pro Application...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Send className="h-4 w-4" />
            Submit Partner Application
          </span>
        )}
      </button>
    </form>
  )
}
