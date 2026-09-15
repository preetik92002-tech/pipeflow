/**
 * Centralized Analytics & Marketing Attribution System
 * Supports Google Analytics 4 and Meta Pixel with deduplication
 */

export type AnalyticsEvent =
  | 'page_view'
  | 'view_service'
  | 'select_service'
  | 'start_quote'
  | 'submit_quote'
  | 'start_booking'
  | 'submit_booking'
  | 'phone_click'
  | 'email_click'
  | 'service_area_search'
  | 'blog_view'
  | 'blog_cta_click'
  | 'pro_application_start'
  | 'pro_application_submit'
  // Booking modal specific
  | 'booking_modal_open'
  | 'booking_category_selected'
  | 'booking_service_selected'

interface EventParams {
  service_name?: string
  service_category?: string
  service_area?: string
  zip_code?: string
  article_title?: string
  article_slug?: string
  cta_location?: string
  trade?: string
  value?: number
  currency?: string
  [key: string]: unknown
}

export interface MarketingAttribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  fbclid?: string
  referrer?: string
  landing_page?: string
  first_touch_at?: string
}

const ATTRIBUTION_KEY = 'pipeflow_attribution'
const recentEvents = new Set<string>()

/**
 * Capture and persist marketing attribution across the visitor's session
 */
export function initAttribution(): MarketingAttribution {
  if (typeof window === 'undefined') return {}

  try {
    const existing = localStorage.getItem(ATTRIBUTION_KEY)
    const params = new URLSearchParams(window.location.search)

    const utmSource = params.get('utm_source') || undefined
    const utmMedium = params.get('utm_medium') || undefined
    const utmCampaign = params.get('utm_campaign') || undefined
    const utmTerm = params.get('utm_term') || undefined
    const utmContent = params.get('utm_content') || undefined
    const gclid = params.get('gclid') || undefined
    const fbclid = params.get('fbclid') || undefined

    // If new campaign parameters are present, update attribution
    if (utmSource || gclid || fbclid) {
      const attribution: MarketingAttribution = {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_term: utmTerm,
        utm_content: utmContent,
        gclid,
        fbclid,
        referrer: document.referrer || undefined,
        landing_page: window.location.pathname,
        first_touch_at: new Date().toISOString(),
      }
      localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution))
      return attribution
    }

    if (existing) {
      return JSON.parse(existing)
    }

    // First visit without UTM
    const initialAttribution: MarketingAttribution = {
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname,
      first_touch_at: new Date().toISOString(),
    }
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(initialAttribution))
    return initialAttribution
  } catch {
    return {}
  }
}

export function getStoredAttribution(): MarketingAttribution {
  if (typeof window === 'undefined') return {}
  try {
    const existing = localStorage.getItem(ATTRIBUTION_KEY)
    return existing ? JSON.parse(existing) : {}
  } catch {
    return {}
  }
}

/**
 * Track custom event across GA4 and Meta Pixel
 */
export function trackEvent(event: AnalyticsEvent, params: EventParams = {}) {
  if (typeof window === 'undefined') return

  // Deduplication check: prevent identical events fired within 1 second
  const dedupeKey = `${event}:${JSON.stringify(params)}`
  if (recentEvents.has(dedupeKey)) return

  recentEvents.add(dedupeKey)
  setTimeout(() => recentEvents.delete(dedupeKey), 1000)

  // Attach stored marketing attribution
  const attribution = getStoredAttribution()
  const payload = { ...params, ...attribution }

  // 1. Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, payload)
  }

  // 2. Meta Pixel
  if (typeof window.fbq === 'function') {
    switch (event) {
      case 'submit_booking':
      case 'submit_quote':
        window.fbq('track', 'Lead', payload)
        break
      case 'start_booking':
      case 'start_quote':
        window.fbq('track', 'InitiateCheckout', payload)
        break
      case 'phone_click':
      case 'email_click':
        window.fbq('track', 'Contact', payload)
        break
      case 'view_service':
      case 'blog_view':
        window.fbq('track', 'ViewContent', payload)
        break
      default:
        window.fbq('trackCustom', event, payload)
        break
    }
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Event] ${event}`, payload)
  }
}

// Global declaration for window.gtag and window.fbq
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}
