'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Droplets,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { getStoredAttribution, trackEvent } from '@/lib/analytics/tracker'
import { PageHero } from '@/components/sections/PageHero'

export default function ContactPage() {
  const { company } = siteConfig
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formOpenedAt] = useState(() => new Date().toISOString())

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('general')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage('Please provide your name, phone number, and message.')
      return
    }

    setIsSubmitting(true)
    try {
      const attribution = getStoredAttribution()
      const payload = {
        name,
        phone,
        email,
        serviceType: subject,
        serviceArea: 'Denver Area',
        message: `[Contact Form - ${subject}] ${message}`,
        website_url_hp: honeypot,
        formOpenedAt,
        ...attribution,
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to submit message. Please call our Denver office directly.')
      }

      setSubmitted(true)
      trackEvent('phone_click', { cta_location: 'contact_form_success' })
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try calling us.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Cinematic Hero */}
      <PageHero
        imageSrc="/assets/hero-about.jpg"
        imageAlt="PipeFlow Denver headquarters and dispatch operations overlooking Colorado mountain range"
        eyebrow="Denver Headquarters &amp; Dispatch"
        eyebrowIcon={Phone}
        title="Get in touch with PipeFlow Co."
        description="Have a question about an upcoming project, need service area confirmation, or require immediate 24/7 emergency dispatch? We are here to help."
        primaryCta={{
          label: `Call Dispatch: ${company.phone}`,
          href: `tel:${company.phone}`,
          variant: 'red',
          icon: Phone,
          isExternal: true,
        }}
        secondaryCta={{
          label: 'Book Online',
          href: '/book-service',
          variant: 'outline',
          icon: Calendar,
        }}
        badgeText="Denver Front Range Master Plumbers &amp; HVAC Mechanics"
      />

      {/* Main Grid */}
      <div className="section-padding bg-neutral-50">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Contact Cards & Emergency Protocols (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Info Card */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="text-xl font-bold font-display text-navy-900">Direct Contact Details</h2>

                <div className="space-y-4 text-xs">
                  <a
                    href={`tel:${company.phone}`}
                    className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-blue-50/60 border border-neutral-200 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-2xs text-neutral-400 font-bold uppercase tracking-wider">
                        Phone &amp; 24/7 Dispatch
                      </p>
                      <p className="font-bold text-navy-900 text-sm group-hover:text-brand-blue transition-colors">
                        {company.phone}
                      </p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-blue-50/60 border border-neutral-200 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-2xs text-neutral-400 font-bold uppercase tracking-wider">
                        Email Inquiries
                      </p>
                      <p className="font-bold text-navy-900 text-sm group-hover:text-brand-blue transition-colors">
                        {company.email}
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-2xs text-neutral-400 font-bold uppercase tracking-wider">
                        Denver Metro Dispatch Hub
                      </p>
                      <p className="font-bold text-navy-900 text-xs">
                        {company.address}, {company.city}, {company.state} {company.zip}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-2xs text-neutral-400 font-bold uppercase tracking-wider">
                        Operating Hours
                      </p>
                      <p className="font-bold text-navy-900 text-xs">Mon – Sat: 7:00 AM – 8:00 PM</p>
                      <p className="text-brand-red font-bold text-2xs mt-0.5">
                        24/7 Emergency Response on Standby
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Areas Quick Link */}
              <div className="p-6 rounded-3xl bg-navy-900 text-white space-y-3">
                <h3 className="text-sm font-bold font-display">Need Territory Route Verification?</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  We service five Front Range counties including Denver, Arapahoe, Jefferson, Adams, and Douglas.
                </p>
                <Link
                  href="/service-areas"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue-lighter hover:underline pt-1"
                >
                  <span>Explore Colorado Service Areas</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Inquiry Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 lg:p-10 shadow-sm">
                <h2 className="text-xl font-bold font-display text-navy-900 mb-1">
                  Send a Direct Message
                </h2>
                <p className="text-xs text-neutral-500 mb-6">
                  Fill out the details below and our service desk will reply promptly during operating hours.
                </p>

                {submitted ? (
                  <div className="p-8 text-center bg-green-50 border border-green-200 rounded-2xl space-y-3">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                    <h3 className="text-lg font-bold text-navy-900">Message Received</h3>
                    <p className="text-xs text-neutral-600 max-w-md mx-auto">
                      Thank you for contacting PipeFlow Co. A member of our Denver team will review your inquiry and get back to you shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false)
                        setMessage('')
                      }}
                      className="btn-outline !py-2 !px-4 text-xs mt-2"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Anti-spam honeypot */}
                    <input
                      type="text"
                      name="website_url_hp"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Full Name <span className="text-brand-red">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Phone Number <span className="text-brand-red">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(720) 000-0000"
                          className="form-input text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Subject / Inquiry Type
                        </label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="form-input text-xs"
                        >
                          <option value="general">General Question</option>
                          <option value="plumbing">Plumbing Inquiry</option>
                          <option value="hvac">HVAC / Heating Inquiry</option>
                          <option value="commercial">Commercial Services</option>
                          <option value="billing">Billing &amp; Invoices</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        How can we help? <span className="text-brand-red">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please describe your plumbing or heating questions, project scope, or address..."
                        className="form-input text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full !py-3.5 text-xs flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? 'Transmitting Message...' : 'Send Message To PipeFlow'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
