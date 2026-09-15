'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  Phone,
  ShieldCheck,
  Building,
  Home,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { getStoredAttribution, trackEvent } from '@/lib/analytics/tracker'

interface QuoteRequestFormProps {
  initialService?: string
  initialCategory?: string
  initialArea?: string
}

export function QuoteRequestForm({
  initialService,
  initialCategory = 'plumbing',
  initialArea,
}: QuoteRequestFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formOpenedAt] = useState(() => new Date().toISOString())

  // Form Fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [category, setCategory] = useState<'plumbing' | 'hvac'>(
    initialCategory === 'hvac' ? 'hvac' : 'plumbing'
  )
  const [specificService, setSpecificService] = useState(
    initialService || (initialCategory === 'hvac' ? 'ac-repair' : 'leak-repair')
  )
  const [projectType, setProjectType] = useState('repair')
  const [propertyType, setPropertyType] = useState('single-family')
  const [preferredContactMethod, setPreferredContactMethod] = useState('phone')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')

  // Photo
  const [photoInfo, setPhotoInfo] = useState<{ name: string; size: number } | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB')
        return
      }
      setPhotoInfo({ name: file.name, size: file.size })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoInfo(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || !phone.trim() || !zipCode.trim()) {
      setErrorMessage('Please fill in your name, phone number, and Colorado ZIP code.')
      return
    }

    setIsSubmitting(true)
    try {
      const attribution = getStoredAttribution()
      const payload = {
        name,
        phone,
        email,
        zipCode,
        serviceCategory: category,
        specificService,
        projectType,
        propertyType,
        preferredContactMethod,
        message,
        photoName: photoInfo?.name,
        photoSize: photoInfo?.size,
        website_url_hp: honeypot,
        formOpenedAt,
        ...attribution,
      }

      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quote request.')
      }

      trackEvent('submit_quote', {
        service_category: category,
        service_name: specificService,
        zip_code: zipCode,
      })

      setSubmitted(true)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error submitting quote request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableServices = siteConfig.defaultServices.filter((s) => s.category === category)

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 text-center shadow-lg animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border border-green-200">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-navy-900 mb-2">Quote Request Received!</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6 max-w-md mx-auto">
          Thank you, <strong>{name}</strong>. A PipeFlow Colorado project specialist is reviewing
          your project specifications and will contact you via <strong>{preferredContactMethod}</strong>{' '}
          shortly.
        </p>
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 max-w-md mx-auto text-left mb-6">
          <p className="font-bold text-navy-900 mb-1">What happens next:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>We review the scope, equipment requirements, and local code specs.</li>
            <li>We provide a transparent, upfront written estimate.</li>
            <li>No high-pressure sales tactics—take your time to review options.</li>
          </ul>
        </div>
        <Link href="/" className="btn-primary !py-2.5 !px-6 text-xs">
          Return to Homepage
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left Reassurance Column (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
            Upfront &bull; No Surprises
          </span>
          <h2 className="text-2xl font-display font-bold text-navy-900 mt-1 mb-3">
            Tell Us What You Need
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
            A PipeFlow representative will review your project details and provide a transparent,
            accurate estimate. We pride ourselves on honest communication and zero hidden charges.
          </p>

          <div className="space-y-4 pt-4 border-t border-neutral-100 text-xs">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-navy-900">Fixed Upfront Estimates</p>
                <p className="text-neutral-500">Know exactly what the job will cost before tools touch your pipes or furnace.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-navy-900">Colorado Code Compliance</p>
                <p className="text-neutral-500">All replacements and installs satisfy local municipal building standards.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-navy-900">Need Immediate Emergency Dispatch?</p>
                <p className="text-neutral-500">
                  Call our 24/7 desk directly at{' '}
                  <a href={`tel:${siteConfig.company.phone}`} className="font-bold text-brand-blue hover:underline">
                    {siteConfig.company.phone}
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Column (7 cols) */}
      <div className="lg:col-span-7">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-xl space-y-6"
        >
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="hp_quote">Leave blank</label>
            <input
              id="hp_quote"
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="form-label font-bold text-navy-900 text-xs">
                Trade Category <span className="text-brand-red">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as 'plumbing' | 'hvac'
                  setCategory(cat)
                  const firstMatching = siteConfig.defaultServices.find((s) => s.category === cat)
                  if (firstMatching) setSpecificService(firstMatching.slug)
                }}
                className="form-input text-xs"
              >
                <option value="plumbing">Plumbing Services</option>
                <option value="hvac">Heating &amp; Air Conditioning</option>
              </select>
            </div>

            {/* Specific Service */}
            <div>
              <label className="form-label font-bold text-navy-900 text-xs">
                Specific Service <span className="text-brand-red">*</span>
              </label>
              <select
                value={specificService}
                onChange={(e) => setSpecificService(e.target.value)}
                className="form-input text-xs"
              >
                {availableServices.map((svc) => (
                  <option key={svc.id} value={svc.slug}>
                    {svc.title}
                  </option>
                ))}
                <option value="other">Other / Custom Project</option>
              </select>
            </div>

            {/* Project Type */}
            <div>
              <label className="form-label font-bold text-navy-900 text-xs">Project Scope</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="form-input text-xs"
              >
                <option value="repair">Repair / Fix Existing Equipment</option>
                <option value="replacement">System Replacement</option>
                <option value="new-installation">New Installation / Addition</option>
                <option value="inspection">Comprehensive Diagnostic Inspection</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="form-label font-bold text-navy-900 text-xs">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="form-input text-xs"
              >
                <option value="single-family">Single Family Home</option>
                <option value="townhome-condo">Townhome or Condo</option>
                <option value="commercial">Light Commercial Property</option>
                <option value="multi-family">Multi-Family / Rental Unit</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="form-label font-bold text-navy-900 text-xs">
                Full Name <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Wilson"
                className="form-input text-xs"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="form-label font-bold text-navy-900 text-xs">
                Phone Number <span className="text-brand-red">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(720) 555-0188"
                className="form-input text-xs"
              />
            </div>

            {/* Email */}
            <div>
              <label className="form-label font-bold text-navy-900 text-xs">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="david@example.com"
                className="form-input text-xs"
              />
            </div>

            {/* ZIP Code */}
            <div>
              <label className="form-label font-bold text-navy-900 text-xs">
                Colorado ZIP Code <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g. 80202"
                className="form-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="form-label font-bold text-navy-900 text-xs block mb-1">
              Preferred Contact Method
            </label>
            <div className="flex items-center gap-4 text-xs text-neutral-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="phone"
                  checked={preferredContactMethod === 'phone'}
                  onChange={(e) => setPreferredContactMethod(e.target.value)}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>Phone Call</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="text"
                  checked={preferredContactMethod === 'text'}
                  onChange={(e) => setPreferredContactMethod(e.target.value)}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>Text Message</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={preferredContactMethod === 'email'}
                  onChange={(e) => setPreferredContactMethod(e.target.value)}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>Email</span>
              </label>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="form-label font-bold text-navy-900 text-xs">
              Project Details &amp; Equipment Information
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about the equipment brand, age, symptoms, or what you'd like quoted..."
              className="form-input text-xs resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <span className="form-label font-bold text-navy-900 text-xs block mb-1">
              Attach Equipment or Issue Photo (Optional, max 5MB)
            </span>
            {photoPreview ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 inline-flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                />
                <div className="text-left text-xs">
                  <p className="font-semibold text-navy-900 truncate max-w-[150px]">{photoInfo?.name}</p>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-brand-red text-2xs hover:underline flex items-center gap-0.5 mt-0.5"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-brand-blue rounded-xl p-4 text-center cursor-pointer transition-colors bg-neutral-50/50 text-xs"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Upload className="h-5 w-5 text-neutral-400 mx-auto mb-1" />
                <span className="text-neutral-600 font-medium">
                  Click or drag to attach a photo of your furnace tag, leak, or breaker
                </span>
              </div>
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
                Submitting Quote Request...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                Request Upfront Quote
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
