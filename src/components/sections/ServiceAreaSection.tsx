import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ServiceArea } from '@/types'

interface ServiceAreaSectionProps {
  areas: ServiceArea[]
  heading?: string
  description?: string
}

export function ServiceAreaSection({ areas, heading = 'Service Areas', description = 'Proudly serving Denver and surrounding Colorado communities.' }: ServiceAreaSectionProps) {
  return (
    <section className="section-padding bg-white" aria-labelledby="areas-heading">
      <div className="container-site">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2
              id="areas-heading"
              className="text-3xl sm:text-4xl font-display font-bold text-navy-800 mb-2"
            >
              {heading}
            </h2>
            <p className="text-neutral-500">
              {description}
            </p>
          </div>
          <Link href="/service-areas" className="btn-outline whitespace-nowrap flex-shrink-0">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            View All Areas
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/service-areas/${area.slug}`}
              className={cn(
                'group flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium',
                'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue',
                area.primary
                  ? 'border-brand-blue/30 bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white hover:border-brand-blue'
                  : 'border-neutral-200 bg-white text-navy-700 hover:border-brand-blue/30 hover:bg-blue-50 hover:text-brand-blue'
              )}
            >
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{area.name}</span>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-sm text-neutral-400 text-center">
          Don&apos;t see your area?{' '}
          <Link href="/contact" className="text-brand-blue hover:underline font-medium">
            Contact us
          </Link>{' '}
          — we may still be able to help.
        </p>
      </div>
    </section>
  )
}
export default ServiceAreaSection
