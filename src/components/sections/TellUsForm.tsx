'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Send,
  AlertCircle,
  CheckCircle2,
  Phone,
  Upload,
  X,
  FileImage,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

const formSchema = z.object({
  name: z.string().min(2, 'Please provide your full name'),
  phone: z.string().min(10, 'Please provide a valid 10-digit phone number'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  serviceCategory: z.enum(['plumbing', 'hvac', 'emergency', 'other'], {
    errorMap: () => ({ message: 'Please select a service category' }),
  }),
  specificService: z.string().min(1, 'Please select the specific issue or service'),
  zipCode: z.string().regex(/^\d{5}$/, 'Please enter a valid 5-digit Colorado ZIP code'),
  preferredTime: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().optional(),
  isEmergency: z.boolean(),
})

type FormSchema = z.infer<typeof formSchema>

interface AttributionData {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  gclid?: string
  fbclid?: string
  referrer?: string
  landingPage?: string
}

export function TellUsForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoInfo, setPhotoInfo] = useState<{ name: string; size: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attribution, setAttribution] = useState<AttributionData>({})

  // Capture UTM parameters, GCLID, FBCLID, and referrer on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setAttribution({
        utmSource: params.get('utm_source') || undefined,
        utmMedium: params.get('utm_medium') || undefined,
        utmCampaign: params.get('utm_campaign') || undefined,
        utmTerm: params.get('utm_term') || undefined,
        utmContent: params.get('utm_content') || undefined,
        gclid: params.get('gclid') || undefined,
        fbclid: params.get('fbclid') || undefined,
        referrer: document.referrer || undefined,
        landingPage: window.location.pathname,
      })
    }
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceCategory: 'plumbing',
      specificService: 'leak-repair',
      isEmergency: false,
    },
  })

  const selectedCategory = watch('serviceCategory')
  const isEmergency = watch('isEmergency')

  // Filter specific services matching category
  const availableServices = siteConfig.defaultServices.filter(
    (s) => s.category === selectedCategory
  )

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo must be less than 5MB')
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
    setPhotoPreview(null)
    setPhotoInfo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: FormSchema) => {
    setSubmitError(null)
    try {
      const payload = {
        ...data,
        photoName: photoInfo?.name,
        photoSize: photoInfo?.size,
        ...attribution,
        submittedAt: new Date().toISOString(),
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to submit request')
      }

      setSubmitted(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please call us directly.'
      setSubmitError(msg)
    }
  }

  return (
    <section
      id="request-service"
      className="section-padding bg-white scroll-mt-20"
      aria-labelledby="tell-us-heading"
    >
      <div className="container-site">
        <ScrollReveal direction="up" distance={24} className="max-w-4xl mx-auto rounded-3xl border border-neutral-200/80 bg-white shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-navy-900 text-white p-6 sm:p-10 border-b border-navy-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-blue-lighter">
                  Quick Service Dispatch
                </span>
                <h2
                  id="tell-us-heading"
                  className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mt-1"
                >
                  Tell Us What’s Going On
                </h2>
                <p className="text-sm sm:text-base text-neutral-300 mt-2 max-w-xl">
                  Share a few quick details about your plumbing or HVAC issue. Our Denver dispatch
                  team responds promptly with upfront options.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 flex items-center gap-3 backdrop-blur-sm self-stretch sm:self-auto">
                <Clock className="h-5 w-5 text-brand-blue-lighter flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-neutral-300 font-medium">Need immediate help?</p>
                  <a
                    href={`tel:${siteConfig.company.phone}`}
                    className="text-sm font-bold text-white hover:text-brand-blue-lighter transition-colors"
                  >
                    {siteConfig.company.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-10">
            {submitted ? (
              <div className="py-12 text-center max-w-lg mx-auto animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Request Received!</h3>
                <p className="text-neutral-600 text-sm sm:text-base mb-6 leading-relaxed">
                  Thank you. A PipeFlow Colorado service coordinator is reviewing your request now
                  and will contact you shortly to confirm your dispatch window.
                </p>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-left mb-6 text-xs text-neutral-600 space-y-1">
                  <p><strong>For emergency burst pipes or heating outages:</strong> Call us right away at {siteConfig.company.phone} for 24/7 priority response.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    removePhoto()
                  }}
                  className="btn-outline text-xs"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Emergency Toggle Bar */}
                <div className="mb-8 rounded-2xl bg-red-50/70 border border-red-200 p-4 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('isEmergency')}
                      className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red"
                    />
                    <div>
                      <span className="text-sm font-bold text-navy-900 block">
                        🚨 This is an active emergency (Major leak, flooding, no heat in winter)
                      </span>
                      <span className="text-xs text-neutral-600">
                        Checking this marks your ticket for priority Denver dispatch.
                      </span>
                    </div>
                  </label>
                </div>

                {/* 2-Column Desktop Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Category Selection */}
                  <div>
                    <label htmlFor="serviceCategory" className="form-label font-bold text-navy-900">
                      Service Trade <span className="text-brand-red">*</span>
                    </label>
                    <select
                      id="serviceCategory"
                      {...register('serviceCategory', {
                        onChange: (e) => {
                          const cat = e.target.value
                          const firstMatching = siteConfig.defaultServices.find((s) => s.category === cat)
                          if (firstMatching) {
                            setValue('specificService', firstMatching.slug)
                          }
                        },
                      })}
                      className={cn('form-input', errors.serviceCategory && 'form-input-error')}
                    >
                      <option value="plumbing">Plumbing Services</option>
                      <option value="hvac">Heating &amp; Air Conditioning</option>
                    </select>
                  </div>

                  {/* Specific Service Dropdown */}
                  <div>
                    <label htmlFor="specificService" className="form-label font-bold text-navy-900">
                      Specific Service Needed <span className="text-brand-red">*</span>
                    </label>
                    <select
                      id="specificService"
                      {...register('specificService')}
                      className={cn('form-input', errors.specificService && 'form-input-error')}
                    >
                      {availableServices.map((svc) => (
                        <option key={svc.id} value={svc.slug}>
                          {svc.title}
                        </option>
                      ))}
                      <option value="other">Other / Not Sure</option>
                    </select>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="form-label font-bold text-navy-900">
                      Full Name <span className="text-brand-red">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g. Sarah Miller"
                      autoComplete="name"
                      {...register('name')}
                      className={cn('form-input', errors.name && 'form-input-error')}
                    />
                    {errors.name && (
                      <p role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="form-label font-bold text-navy-900">
                      Phone Number <span className="text-brand-red">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="(720) 555-0199"
                      autoComplete="tel"
                      {...register('phone')}
                      className={cn('form-input', errors.phone && 'form-input-error')}
                    />
                    {errors.phone && (
                      <p role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label font-bold text-navy-900">
                      Email Address <span className="text-neutral-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="sarah@example.com"
                      autoComplete="email"
                      {...register('email')}
                      className={cn('form-input', errors.email && 'form-input-error')}
                    />
                    {errors.email && (
                      <p role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label htmlFor="zipCode" className="form-label font-bold text-navy-900">
                      Colorado ZIP Code <span className="text-brand-red">*</span>
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      maxLength={5}
                      placeholder="e.g. 80202"
                      {...register('zipCode')}
                      className={cn('form-input', errors.zipCode && 'form-input-error')}
                    />
                    {errors.zipCode && (
                      <p role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.zipCode.message}
                      </p>
                    )}
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label htmlFor="preferredDate" className="form-label font-bold text-navy-900">
                      Preferred Date <span className="text-neutral-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="preferredDate"
                      type="date"
                      {...register('preferredDate')}
                      className="form-input"
                    />
                  </div>

                  {/* Preferred Time Window */}
                  <div>
                    <label htmlFor="preferredTime" className="form-label font-bold text-navy-900">
                      Preferred Time Window <span className="text-neutral-400 font-normal">(optional)</span>
                    </label>
                    <select id="preferredTime" {...register('preferredTime')} className="form-input">
                      <option value="">Any time available</option>
                      <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                      <option value="evening">Late Afternoon (4:00 PM - 7:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Message / Details */}
                <div className="mb-6">
                  <label htmlFor="message" className="form-label font-bold text-navy-900">
                    Describe What You&apos;re Experiencing{' '}
                    <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    placeholder="e.g. Water heater leaking around base, or AC blowing room-temperature air..."
                    {...register('message')}
                    className="form-input resize-none"
                  />
                </div>

                {/* Optional Photo Upload */}
                <div className="mb-8">
                  <span className="form-label font-bold text-navy-900 block mb-1">
                    Upload Photo of the Issue{' '}
                    <span className="text-neutral-400 font-normal">(optional, max 5MB)</span>
                  </span>

                  {photoPreview ? (
                    <div className="flex items-center gap-4 p-3 rounded-2xl border border-neutral-200 bg-neutral-50 w-full sm:w-auto inline-flex">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview of issue photo"
                        className="w-16 h-16 object-cover rounded-xl border border-neutral-200"
                      />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-navy-900 truncate max-w-[180px]">
                          {photoInfo?.name}
                        </p>
                        <p className="text-2xs text-neutral-500">
                          {photoInfo && (photoInfo.size / 1024).toFixed(0)} KB
                        </p>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="text-xs text-brand-red hover:underline mt-1 inline-flex items-center gap-1"
                        >
                          <X className="h-3 w-3" /> Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-300 hover:border-brand-blue/60 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-blue-50/20"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Upload className="h-6 w-6 text-neutral-400 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-navy-800">
                        Click or tap to attach a photo of your faucet, furnace, or pipe
                      </p>
                      <p className="text-2xs text-neutral-500 mt-0.5">JPEG, PNG, or WebP up to 5MB</p>
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Submit CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Your information is strictly protected. Zero spam guarantee.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full sm:w-auto !py-3.5 !px-8 !text-base shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting Request...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Request Service
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
export default TellUsForm
