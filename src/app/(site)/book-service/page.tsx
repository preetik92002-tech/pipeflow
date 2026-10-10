import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'
import { RequestServiceFlow, type RequestPrefill } from '@/components/request/RequestServiceFlow'
import { hasRealPhone } from '@/lib/config/contact'
import { CITIES, SERVICES, URGENCY } from '@/lib/requests/schema'
import { generateMetadata as genMeta, getPublicCompanySettings } from '@/lib/seo/metadata'
import { siteConfig } from '@/lib/config/site'

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
    title: 'Request Plumbing or HVAC Service in Denver & Boulder',
    description: 'Tell us what you need, add photos and choose a time. We match your request with local plumbing and HVAC professionals serving Denver or Boulder.',
    path: '/book-service',
  })
}

type Params = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

function toPrefill(sp: Params): RequestPrefill {
  const category = one(sp.category) === 'hvac' ? 'hvac' : one(sp.category) === 'plumbing' ? 'plumbing' : undefined
  const serviceParam = one(sp.service)
  const service = category && serviceParam && SERVICES[category].some((s) => s.value === serviceParam) ? serviceParam : undefined
  const cityParam = one(sp.city)?.toLowerCase()
  const city = CITIES.find((c) => c.toLowerCase() === cityParam)
  const urgency = URGENCY.find((u) => u.value === one(sp.urgency))?.value
  const customerType = one(sp.type) === 'business' ? 'business' : category ? 'homeowner' : one(sp.type) === 'homeowner' ? 'homeowner' : undefined
  return { category, service, city, urgency, customerType }
}

export default async function RequestServicePage({ searchParams }: { searchParams: Promise<Params> }) {
  const prefill = toPrefill(await searchParams)
  const company = await getPublicCompanySettings()
  const phone = company.phone || siteConfig.company.phone

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 py-12 text-white sm:py-16">
        <div className="container-site max-w-3xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />Denver &amp; Boulder
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Request Plumbing or HVAC Service</h1>
          <p className="mt-4 text-lg text-neutral-200">Tell us what you need, add photos if you can, and we will match your request with professionals serving your area.</p>
        </div>
      </section>
      <div className="container-site -mt-6 pb-16 sm:-mt-8">
        <RequestServiceFlow prefill={prefill} phone={hasRealPhone(phone) ? phone : undefined} />
      </div>
    </div>
  )
}
