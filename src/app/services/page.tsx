import type { Metadata } from 'next'
import { ServicesDirectory } from '@/components/cms/ServicesDirectory'
import { getServices } from '@/lib/cms/queries'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> { return genMeta({ title: 'Plumbing & HVAC Services — Denver, CO', description: 'Plumbing, heating, and cooling services from PipeFlow Co. across the Denver metro area.', path: '/services' }) }

export default async function ServicesPage() {
  return <ServicesDirectory services={await getServices()} />
}
