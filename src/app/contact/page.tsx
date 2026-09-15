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
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { getStoredAttribution, trackEvent } from '@/lib/analytics/tracker'

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
        throw new Error('Failed to submit message.')
      }

      trackEvent('email_click', { cta_location: 'contact_page_form' })
      setSubmitted(true)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error submitting message.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 text-white section-padding relative overflow-hidden">
        <div className="container-site relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
            <Phone className="h-3.5 w-3.5" />
            <span>Denver Headquarters &amp; Dispatch</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-4 leading-tight">
            Contact PipeFlow Co.
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Have a question about an upcoming project, need service area confirmation, or require
            immediate 24/7 emergency dispatch? We are here to help.
          </p>
        </div>
      </section>

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
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-2xs text-neutral-400 font-bold uppercase tracking-wider">
                        Hours of Operation
                      </p>
                      <p className="font-bold text-navy-900 text-sm">Monday – Friday: 7:00 AM – 7:00 PM</p>
                      <p className="text-2xs text-neutral-500 mt-0.5">
                        Saturday – Sunday: 8:00 AM – 5:00 PM &bull; 24/7 Emergency Line Open
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-2xs text-neutral-400 font-bold uppercase tracking-wider">
                        Denver Operating Territory
                      </p>
                      <p className="font-bold text-navy-900 text-sm">
                        {company.city}, {company.state} {company.zip}
                      </p>
                      <p className="text-2xs text-neutral-500 mt-0.5">
                        Serving Denver, Arapahoe, Jefferson, Adams &amp; Douglas Counties
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Instructions Card */}
              <div className="bg-red-50/90 rounded-3xl border border-red-200 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-brand-red font-bold text-sm">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Emergency Home Protocols</span>
                </div>
                <div className="space-y-3 text-xs text-neutral-700">
                  <div className="p-3 bg-white/80 rounded-xl border border-red-100">
                    <p className="font-bold text-navy-900 flex items-center gap-1.5 mb-0.5">
                      <Droplets className="h-3.5 w-3.5 text-brand-blue" />
                      Active Water Burst / Flooding:
                    </p>
                    <p>
                      Immediately shut off your home main water valve (typically in the basement near the water meter or front street curb).
                    </p>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-red-100">
                    <p className="font-bold text-navy-900 flex items-center gap-1.5 mb-0.5">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      Natural Gas Odor (Rotten Eggs):
                    </p>
                    <p>
                      Evacuate all family members immediately. Do not flip light switches or ignite flames. Call Xcel Energy (1-800-895-2999) or 911.
                    </p>
                  </div>
                </div>
              </div>

              {/* Map-Ready Location Card */}
              <div className="bg-navy-900 rounded-3xl border border-navy-800 p-6 text-white text-xs space-y-2">
                <p className="font-bold text-sm flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-blue-lighter" />
                  Front Range Service Radius
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  Mobile trucks dispatched daily across I-25, I-70, C-470, and E-470 corridors.
                </p>
              </div>
            </div>

            {/* Right Column: Contact Message Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-xl">
                {submitted ? (
                  <div className="py-12 text-center max-w-md mx-auto animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border border-green-200">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold font-display text-navy-900 mb-2">Message Sent!</h2>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                      Thank you, <strong>{name}</strong>. A member of our Denver team will review your
                      inquiry and respond within one business day.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="btn-outline !py-2 !px-5 text-xs"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="hp_contact">Leave blank</label>
                      <input
                        id="hp_contact"
                        type="text"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold font-display text-navy-900 mb-1">
                        Send Us a Direct Message
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Fill out the form below and our team will get back to you promptly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="form-label font-bold text-navy-900 text-xs">
                          Your Name <span className="text-brand-red">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rachel Adams"
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
                          placeholder="(720) 555-0199"
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="form-label font-bold text-navy-900 text-xs">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rachel@example.com"
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="form-label font-bold text-navy-900 text-xs">Inquiry Topic</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="form-input text-xs"
                        >
                          <option value="general">General Inquiries</option>
                          <option value="plumbing-question">Plumbing Technical Question</option>
                          <option value="hvac-question">HVAC Technical Question</option>
                          <option value="quote-followup">Follow-Up on an Existing Quote</option>
                          <option value="warranty">Warranty or Completed Service</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="form-label font-bold text-navy-900 text-xs">
                        How can we help you? <span className="text-brand-red">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your question or request here..."
                        className="form-input text-xs resize-none"
                      />
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
                          Sending Message...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Send className="h-4 w-4" />
                          Send Message
                        </span>
                      )}
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
