'use client'

import { useEffect, useState } from 'react'
import {
  Settings,
  Phone,
  Mail,
  MapPin,
  Shield,
  Save,
  CheckCircle2,
  Bell,
  BarChart3,
  Clock,
  Database,
  ExternalLink,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

export default function AdminSettingsPage() {
  const [companyName, setCompanyName] = useState(siteConfig.company.name)
  const [phone, setPhone] = useState(siteConfig.company.phone)
  const [email, setEmail] = useState(siteConfig.company.email)
  const [address, setAddress] = useState(siteConfig.company.address)
  const [city, setCity] = useState(siteConfig.company.city)
  const [state, setState] = useState(siteConfig.company.state)
  const [zip, setZip] = useState(siteConfig.company.zip)
  const [license, setLicense] = useState(siteConfig.company.license)

  // Announcement Banner
  const [bannerEnabled, setBannerEnabled] = useState(siteConfig.announcement.enabled)
  const [bannerMessages, setBannerMessages] = useState(
    siteConfig.announcement.messages.join('\n')
  )

  // Analytics & Tracking IDs
  const [gaMeasurementId, setGaMeasurementId] = useState('')
  const [googleAdsId, setGoogleAdsId] = useState('')
  const [googleAdsConversionLabel, setGoogleAdsConversionLabel] = useState('')
  const [metaPixelId, setMetaPixelId] = useState('')
  const [trackingEnabled, setTrackingEnabled] = useState(true)

  // Operating Hours
  const [weekdayHours, setWeekdayHours] = useState('')
  const [weekendHours, setWeekendHours] = useState('')
  const [emergencyAvailable, setEmergencyAvailable] = useState(true)

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadSettings = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const response = await fetch('/api/admin/settings')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load settings.')
      if (result.company?.name) setCompanyName(result.company.name)
      if (result.company?.phone) setPhone(result.company.phone)
      if (result.company?.email) setEmail(result.company.email)
      setAddress(result.company?.address ?? siteConfig.company.address)
      setCity(result.company?.city ?? siteConfig.company.city)
      setState(result.company?.state ?? siteConfig.company.state)
      setZip(result.company?.zip ?? siteConfig.company.zip)
      setLicense(result.company?.license ?? siteConfig.company.license)
      setBannerEnabled(Boolean(result.banner?.enabled))
      setBannerMessages(Array.isArray(result.banner?.messages) ? result.banner.messages.join('\n') : typeof result.banner?.text === 'string' ? result.banner.text : siteConfig.announcement.messages.join('\n'))
      setGaMeasurementId(result.analytics?.ga_measurement_id || '')
      setGoogleAdsId(result.analytics?.google_ads_id || '')
      setGoogleAdsConversionLabel(result.analytics?.google_ads_conversion_label || '')
      setMetaPixelId(result.analytics?.meta_pixel_id || '')
      setTrackingEnabled(result.analytics?.tracking_enabled ?? false)
      setWeekdayHours(result.hours?.weekday || '')
      setWeekendHours(result.hours?.weekend || '')
      setEmergencyAvailable(Boolean(result.hours?.emergency_available))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadSettings() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: { name: companyName, phone, email, address, city, state, zip, license },
          banner: { enabled: bannerEnabled, messages: bannerMessages.split('\n').map((line) => line.trim()).filter(Boolean) },
          analytics: { ga_measurement_id: gaMeasurementId, google_ads_id: googleAdsId, google_ads_conversion_label: googleAdsConversionLabel, meta_pixel_id: metaPixelId, tracking_enabled: trackingEnabled },
          hours: { weekday: weekdayHours, weekend: weekendHours, emergency_available: emergencyAvailable },
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save settings.')
      showToast('Settings saved.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="alert" className="fixed bottom-6 right-6 z-50 bg-red-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-red-700 animate-fade-in">
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-navy-900">
            Global Business & Integration Settings
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Manage contact channels, license numbers, emergency announcement bars, and third-party tracking tags.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-xs self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError} <button type="button" className="ml-2 underline" onClick={() => void loadSettings()}>Retry</button></div>}
        {loading && <p role="status" className="text-sm text-neutral-600">Loading saved settings…</p>}
        {/* Database / Supabase Connection Status Card */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-navy-900">Supabase Connection State</h3>
                <span className="text-2xs font-semibold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Not verified
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Configure Supabase and apply all project migrations before relying on this connection.
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark border border-neutral-300 px-3.5 py-2 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Contact Details */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Phone className="h-5 w-5 text-brand-blue" />
              Company Details & Phone
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Business Legal Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Primary Phone (24/7 Hotline)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Customer Support Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Colorado State License # / Registration
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="e.g. CO Master Plumber #MP-0012345"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics & Ad Attribution Integrations */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-blue" />
              Marketing & Conversion Tracking
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  value={gaMeasurementId}
                  onChange={(e) => setGaMeasurementId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Google Ads Conversion ID
                  </label>
                  <input
                    type="text"
                    value={googleAdsId}
                    onChange={(e) => setGoogleAdsId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="AW-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Conversion Label
                  </label>
                  <input
                    type="text"
                    value={googleAdsConversionLabel}
                    onChange={(e) => setGoogleAdsConversionLabel(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="AbCdEfGhIjK..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Meta (Facebook) Pixel ID
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="123456789012345"
                />
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">
                  Global Marketing Tracking
                </span>
                <button
                  type="button"
                  onClick={() => setTrackingEnabled(!trackingEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    trackingEnabled ? 'bg-brand-blue' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                      trackingEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Notice & Hours Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Notification Strip */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand-blue" />
                Emergency Notification Banner
              </h2>
              <button
                type="button"
                onClick={() => setBannerEnabled(!bannerEnabled)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  bannerEnabled ? 'bg-emerald-500' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                    bannerEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Announcement Messages (1 per line)
              </label>
              <textarea
                rows={4}
                value={bannerMessages}
                onChange={(e) => setBannerMessages(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue leading-relaxed"
              />
            </div>
          </div>

          {/* Operating Hours & Dispatch */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-blue" />
              Hours & Dispatch Availability
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Monday – Friday Hours
                </label>
                <input
                  type="text"
                  value={weekdayHours}
                  onChange={(e) => setWeekdayHours(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Saturday – Sunday Hours
                </label>
                <input
                  type="text"
                  value={weekendHours}
                  onChange={(e) => setWeekendHours(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                <span className="text-xs font-medium text-navy-900">
                  24/7 Emergency Dispatch Active
                </span>
                <input
                  type="checkbox"
                  checked={emergencyAvailable}
                  onChange={(e) => setEmergencyAvailable(e.target.checked)}
                  className="rounded text-brand-red focus:ring-brand-red h-4 w-4"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
