import type { Metadata } from 'next'
import { ServicesDirectory } from '@/components/cms/ServicesDirectory'
import { getServices } from '@/lib/cms/queries'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> { return genMeta({ title: 'Denver Residential Plumbing Services — PipeFlow Co.', description: 'Plumbing repairs, drain cleaning, water heater service, sewer repairs, and pipe work across Denver.', path: '/services/plumbing' }) }

export default async function PlumbingCategoryPage() {
  return <ServicesDirectory category="plumbing" services={await getServices('plumbing')} />
}
