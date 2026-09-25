import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Search, Phone } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ServiceAreaChecker } from '@/components/sections/ServiceAreaChecker'
import { PageHero } from '@/components/sections/PageHero'
import { getServiceAreas, toSiteServiceArea } from '@/lib/cms/queries'
import { generateMetadata as genMeta, getPublicCompanySettings } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> { return genMeta({ title: 'Colorado Service Areas — Denver Metro | PipeFlow Co.', description: 'Find PipeFlow plumbing and HVAC service areas across the Colorado Front Range.', path: '/service-areas' }) }

export default async function ServiceAreasDirectoryPage() {
  const [areas, company] = await Promise.all([getServiceAreas(), getPublicCompanySettings()])
  return <div className="bg-white min-h-screen">
    <PageHero imageSrc="/assets/hero-service-areas.jpg" imageAlt="PipeFlow technician arriving at a Colorado home" eyebrow="Regional Colorado Coverage" eyebrowIcon={MapPin} title="Serving Colorado homeowners across the Front Range." description="Check availability and find your community below." primaryCta={{ label: 'Find a Specialist', href: '#service-area-checker', variant: 'red', icon: Search }} secondaryCta={{ label: 'Call Dispatch Direct', href: `tel:${company.phone || siteConfig.company.phone}`, variant: 'outline', icon: Phone, isExternal: true }} badgeText="Active PipeFlow service locations" />
    <div id="service-area-checker" className="scroll-mt-20"><ServiceAreaChecker areas={areas.map(toSiteServiceArea)} /></div>
    <section className="section-padding container-site"><div className="max-w-2xl mb-10"><h2 className="text-3xl font-bold font-display text-navy-900">Front Range Communities We Serve</h2><p className="text-sm text-neutral-500 mt-2">Service locations are maintained by PipeFlow dispatch.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{areas.map((area) => <Link key={area.id} href={`/service-areas/${area.slug}`} className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-brand-blue/40 hover:shadow-card-hover"><span><span className="block font-bold text-navy-900">{area.name}, {area.state}</span><span className="mt-1 block text-xs text-neutral-500">{area.description || 'Plumbing and HVAC services available.'}</span></span><ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-brand-blue" /></Link>)}</div></section>
  </div>
}
