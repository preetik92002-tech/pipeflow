'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { initAttribution, trackEvent } from '@/lib/analytics/tracker'
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider'

export function AnalyticsProvider() {
  const { analytics } = useSiteSettings()
  const gaId = analytics.enabled ? (analytics.gaMeasurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) : undefined
  const metaPixelId = analytics.enabled ? (analytics.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID) : undefined

  useEffect(() => {
    // Initialize attribution storage on initial load
    initAttribution()

    // Global listener for phone and email clicks
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href') || ''
      if (href.startsWith('tel:')) {
        trackEvent('phone_click', {
          phone_number: href.replace('tel:', ''),
          cta_location: target.getAttribute('aria-label') || 'unspecified',
        })
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
