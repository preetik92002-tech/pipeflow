import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { StickyMobileCTA } from '@/components/layout/StickyMobileCTA'
import { FloatingCallButton } from '@/components/layout/FloatingCallButton'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { BookingModalProvider } from '@/components/booking/BookingModalProvider'
import { generateMetadata as genMeta, generateLocalBusinessSchema } from '@/lib/seo/metadata'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = genMeta()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ldJson = generateLocalBusinessSchema()

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <BookingModalProvider>
          <AnalyticsProvider />
          <Header />
          <main id="main-content" className="flex-1 pb-16 lg:pb-0" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <StickyMobileCTA />
          <FloatingCallButton />
        </BookingModalProvider>
      </body>
    </html>
  )
}
