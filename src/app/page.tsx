import type { Metadata } from 'next'
import { HomePageClient } from '@/components/home/HomePageClient'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = genMeta({
  title: 'Reliable Plumbing & HVAC Service When You Need It — Denver, CO',
  description:
    'PipeFlow Co. provides licensed plumbing and HVAC services across Denver, Aurora, Lakewood, and surrounding Colorado communities. Same-day service, upfront pricing, and 24/7 emergency dispatch.',
  path: '/',
})

export default function HomePage() {
  return <HomePageClient />
}
