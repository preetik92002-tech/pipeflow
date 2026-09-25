import type { Metadata } from 'next'
import { ServicesDirectory } from '@/components/cms/ServicesDirectory'
import { getServices } from '@/lib/cms/queries'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> { return genMeta({ title: 'Denver Heating, Cooling & Heat Pumps — PipeFlow Co.', description: 'Residential HVAC service across Denver: furnace, AC, heat pumps, maintenance, and indoor air quality.', path: '/services/hvac' }) }

export default async function HvacCategoryPage() {
  return <ServicesDirectory category="hvac" services={await getServices('hvac')} />
}
