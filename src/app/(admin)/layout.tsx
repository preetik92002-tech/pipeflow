import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import '../globals.css'

// The admin has its own root layout so the public header, footer, booking modal
// and analytics never load inside it, and none of the admin code loads on public pages.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap', weight: ['400', '500', '600', '700', '800'] })

export const metadata: Metadata = {
  title: 'PipeFlow Admin',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-neutral-100 font-sans text-neutral-800 antialiased">{children}</body>
    </html>
  )
}
