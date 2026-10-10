import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { RequestServiceFlow } from '@/components/request/RequestServiceFlow'
import { hasRealPhone } from '@/lib/config/contact'
import { toPrefill, type PrefillParams } from '@/lib/requests/prefill'
import { generateMetadata as genMeta, getPublicCompanySettings } from '@/lib/seo/metadata'
import { siteConfig } from '@/lib/config/site'

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: 'Request Plumbing or HVAC Service in Denver & Boulder',
    description: 'Tell us what you need, add photos and choose a time. We match your request with local plumbing and HVAC professionals serving Denver or Boulder.',
    path: '/book-service',
  })
}

export default async function RequestServicePage({ searchParams }: { searchParams: Promise<PrefillParams> }) {
  const prefill = toPrefill(await searchParams)
  const company = await getPublicCompanySettings()
  const phone = company.phone || siteConfig.company.phone

  return (
    <div className="bg-paper">
      <section className="border-b border-line">
        <div className="container-wide py-14 sm:py-20">
          <div className="hero-enter max-w-3xl">
            <p className="eyebrow">Denver &amp; Boulder</p>
            <h1 className="mt-5 font-display text-display-xl font-normal text-ink">Request plumbing or HVAC service</h1>
            <p className="mt-5 max-w-2xl text-lead text-neutral-700">Tell us what you need, add photos if you can, and we will match your request with professionals serving your area.</p>
          </div>
        </div>
      </section>
      <div className="container-wide py-10 sm:py-14 lg:pb-24">
        <RequestServiceFlow prefill={prefill} phone={hasRealPhone(phone) ? phone : undefined} />
      </div>
    </div>
  )
}
