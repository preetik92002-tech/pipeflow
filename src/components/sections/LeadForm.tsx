'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider'
import type { ServiceArea } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  serviceType: z.string().min(1, 'Please select a service type'),
  serviceArea: z.string().min(1, 'Please select your city/area'),
  message: z.string().optional(),
  isEmergency: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface LeadFormProps {
  className?: string
  compact?: boolean
  title?: string
  areas: ServiceArea[]
}

export function LeadForm({ className, compact = false, title, areas }: LeadFormProps) {
  const { company } = useSiteSettings()
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isEmergency: false },
  })

  const isEmergency = watch('isEmergency')

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please call us directly or try again.')
    }
  }

  if (submitted) {
    return (
      <div className={cn('rounded-2xl bg-green-50 border border-green-200 p-8 text-center', className)}>
        <div className="text-4xl mb-3" aria-hidden="true">✅</div>
        <h3 className="font-bold text-navy-800 text-lg mb-2">Request Received!</h3>
        <p className="text-sm text-neutral-600">
          We&apos;ll be in touch shortly. For emergencies, call us directly at{' '}
          <a
            href={`tel:${company.phone}`}
            className="font-semibold text-brand-blue hover:underline"
          >
            {company.phone}
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl bg-white border border-neutral-100 shadow-card p-6 sm:p-8', className)}>
      {title && <h3 className="text-xl font-bold text-navy-800 mb-6">{title}</h3>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Service request form">
        <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>

          {/* Emergency toggle */}
          <div className={cn(compact ? '' : 'sm:col-span-2')}>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('isEmergency')}
                className="h-4 w-4 rounded border-neutral-300 text-brand-red focus:ring-brand-red focus:ring-offset-0"
              />
              <span className={cn('text-sm font-medium', isEmergency ? 'text-brand-red' : 'text-neutral-600')}>
                🚨 This is an emergency — I need immediate help
              </span>
            </label>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="lead-name" className="form-label">
              Full Name <span aria-hidden="true" className="text-brand-red">*</span>
            </label>
            <input
              id="lead-name"
              type="text"
              autoComplete="name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'lead-name-err' : undefined}
              placeholder="John Smith"
              {...register('name')}
              className={cn('form-input', errors.name && 'form-input-error')}
            />
            {errors.name && (
              <p id="lead-name-err" role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="lead-phone" className="form-label">
              Phone <span aria-hidden="true" className="text-brand-red">*</span>
            </label>
            <input
              id="lead-phone"
              type="tel"
              autoComplete="tel"
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'lead-phone-err' : undefined}
              placeholder="(720) 555-0100"
              {...register('phone')}
              className={cn('form-input', errors.phone && 'form-input-error')}
            />
            {errors.phone && (
              <p id="lead-phone-err" role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          {!compact && (
            <div>
              <label htmlFor="lead-email" className="form-label">
                Email <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                id="lead-email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                {...register('email')}
                className="form-input"
              />
            </div>
          )}

          {/* Service type */}
          <div>
            <label htmlFor="lead-service" className="form-label">
              Service Needed <span aria-hidden="true" className="text-brand-red">*</span>
            </label>
            <select
              id="lead-service"
              aria-required="true"
              aria-invalid={!!errors.serviceType}
              {...register('serviceType')}
              className={cn('form-input', errors.serviceType && 'form-input-error')}
            >
              <option value="">Select a service...</option>
              <optgroup label="Plumbing">
                <option value="drain-cleaning">Drain Cleaning</option>
                <option value="water-heater">Water Heater Service</option>
                <option value="leak-detection">Leak Detection & Repair</option>
                <option value="pipe-repair">Pipe Repair</option>
                <option value="plumbing-other">Other Plumbing</option>
              </optgroup>
              <optgroup label="HVAC">
                <option value="ac-service">AC Installation & Repair</option>
                <option value="heating">Furnace & Heating</option>
                <option value="hvac-maintenance">HVAC Maintenance / Tune-Up</option>
                <option value="hvac-other">Other HVAC</option>
              </optgroup>
              <option value="emergency">🚨 Emergency Service</option>
              <option value="other">Other / Not Sure</option>
            </select>
            {errors.serviceType && (
              <p role="alert" className="mt-1 text-xs text-red-600">{errors.serviceType.message}</p>
            )}
          </div>

          {/* Service area */}
          <div>
            <label htmlFor="lead-area" className="form-label">
              Your City / Area <span aria-hidden="true" className="text-brand-red">*</span>
            </label>
            <select
              id="lead-area"
              aria-required="true"
              aria-invalid={!!errors.serviceArea}
              {...register('serviceArea')}
              className={cn('form-input', errors.serviceArea && 'form-input-error')}
            >
              <option value="">Select your area...</option>
              {areas.map((area) => (
                <option key={area.id} value={area.slug}>
                  {area.name}, CO
                </option>
              ))}
              <option value="other">Other / Outside listed areas</option>
            </select>
            {errors.serviceArea && (
              <p role="alert" className="mt-1 text-xs text-red-600">{errors.serviceArea.message}</p>
            )}
          </div>

          {/* Message */}
          {!compact && (
            <div className="sm:col-span-2">
              <label htmlFor="lead-message" className="form-label">
                Describe the Issue <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="lead-message"
                rows={3}
                placeholder="Briefly describe what's happening..."
                {...register('message')}
                className="form-input resize-none"
              />
            </div>
          )}
        </div>

        {submitError && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full mt-5 !py-3 !text-base"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Sending...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" aria-hidden="true" />
              Request Service
            </span>
          )}
        </button>

        <p className="mt-3 text-xs text-neutral-400 text-center">
          Or call us directly:{' '}
          <a
            href={`tel:${company.phone}`}
            className="font-semibold text-brand-blue hover:underline"
          >
            <Phone className="inline h-3 w-3 mr-0.5" aria-hidden="true" />
            {company.phone}
          </a>
        </p>
      </form>
    </div>
  )
}
export default LeadForm
