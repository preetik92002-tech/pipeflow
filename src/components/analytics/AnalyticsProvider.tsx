'use client'

import { useCallback, useEffect, useRef } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { initAttribution, trackEvent } from '@/lib/analytics/tracker'
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider'

export function AnalyticsProvider() {
  const { analytics } = useSiteSettings()
  const pathname = usePathname()
  const pathnameRef = useRef(pathname)
  const lastReportedPath = useRef<string | null>(null)
  const gaReady = useRef(false)
  const envGaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const configuredGaId = envGaId || analytics.gaMeasurementId
  const gaId = analytics.enabled && configuredGaId && /^G-[A-Z0-9]+$/.test(configuredGaId) ? configuredGaId : undefined
  const metaPixelId = analytics.enabled ? (analytics.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID) : undefined

  pathnameRef.current = pathname

  const sendPageView = useCallback((path: string) => {
    const reportKey = `${gaId}:${path}`
    if (typeof window.gtag !== 'function' || lastReportedPath.current === path || window.__pipeflowGaLastPage === reportKey) return
    const pageLocation = `${window.location.origin}${path}`
    const pageReferrer = lastReportedPath.current
      ? `${window.location.origin}${lastReportedPath.current}`
      : (document.referrer ? new URL(document.referrer).origin : undefined)
    // Set sanitized defaults too, so GA custom events never inherit query
    // strings from the browser's current URL as page context.
    window.gtag('set', { page_location: pageLocation, page_referrer: pageReferrer })
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: pageLocation,
      page_referrer: pageReferrer,
      page_title: document.title,
    })
    lastReportedPath.current = path
    window.__pipeflowGaLastPage = reportKey
  }, [gaId])

  const initializeGa = useCallback(() => {
    if (!gaId) return
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || function gtag(...args: unknown[]) { window.dataLayer?.push(args) }

    // The public layout survives client navigation. This guard also avoids a
    // duplicate config call if React remounts the provider during navigation.
    if (window.__pipeflowGaConfigured !== gaId) {
      window.gtag('js', new Date())
      window.gtag('config', gaId, { send_page_view: false })
      window.__pipeflowGaConfigured = gaId
    }
    gaReady.current = true
    sendPageView(pathnameRef.current)
  }, [gaId, sendPageView])

  useEffect(() => {
    if (gaReady.current) sendPageView(pathname)
  }, [pathname, sendPageView])

  useEffect(() => {
    // Initialize attribution storage on initial load
    initAttribution()

    // Global listener for phone and email clicks
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href') || ''
      if (href.startsWith('tel:')) {
        trackEvent('phone_click', { cta_location: target.getAttribute('aria-label') || 'unspecified' })
      } else if (href.startsWith('mailto:')) {
        trackEvent('email_click', {
          email_address: href.replace('mailto:', ''),
          cta_location: target.getAttribute('aria-label') || 'unspecified',
        })
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  return (
    <>
      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                send_page_view: true
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  )
}
export default AnalyticsProvider
