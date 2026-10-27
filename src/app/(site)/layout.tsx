import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { StickyMobileCTA } from '@/components/layout/StickyMobileCTA'
import { FloatingCallButton } from '@/components/layout/FloatingCallButton'
import { VideoPopup } from '@/components/layout/VideoPopup'
import { THEME_BOOT_SCRIPT } from '@/components/layout/ThemeToggle'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { NavigationProvider } from '@/components/layout/NavigationProvider'
import { getNavigation } from '@/lib/cms-pages/navigation'
import { SiteSettingsProvider } from '@/components/layout/SiteSettingsProvider'
import { generateMetadata as genMeta, generateLocalBusinessSchema, getPublicSiteSettingsBundle } from '@/lib/seo/metadata'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Editorial display face: sirf public site par. Admin apne Sora/Inter khud load karta hai (--font-display wahan define nahi hota),
// isliye public site par Sora ki zaroorat nahi: ek font file aur preload kam.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
})

export async function generateMetadata(): Promise<Metadata> {
  return genMeta()
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [ldJson, siteSettings, navigation] = await Promise.all([generateLocalBusinessSchema(), getPublicSiteSettingsBundle(), getNavigation()])

  return (
    <html lang="en" className={`site ${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* Applies the saved or system theme before paint, so the page never flashes the wrong one. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      </head>
      {/* No full-screen loading intro: the hero is the first paint, so the page is readable as soon as it arrives. */}
      <body className="min-h-screen flex flex-col">
        <SiteSettingsProvider initialSettings={siteSettings}>
          <NavigationProvider navigation={navigation}>
            <AnalyticsProvider />
            <Header />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <StickyMobileCTA />
            <FloatingCallButton />
            <VideoPopup />
          </NavigationProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  )
}
