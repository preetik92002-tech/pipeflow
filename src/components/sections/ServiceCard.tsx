import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  Droplets,
  Flame,
  Search,
  Wind,
  Thermometer,
  AlertTriangle,
  Wrench,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Service } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  droplets: Droplets,
  flame: Flame,
  search: Search,
  wind: Wind,
  thermometer: Thermometer,
  'alert-triangle': AlertTriangle,
  wrench: Wrench,
  zap: Zap,
}

interface ServiceCardProps {
  service: Service
  className?: string
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const Icon = iconMap[service.iconName] ?? Wrench
  const isHVAC = service.category === 'hvac'
  const isEmergency = service.category === 'emergency'

  const iconColor = isHVAC
    ? 'text-orange-500'
    : isEmergency
    ? 'text-brand-red'
    : 'text-brand-blue'

  const iconBg = isHVAC
    ? 'bg-orange-50'
    : isEmergency
    ? 'bg-red-50'
    : 'bg-blue-50'

  return (
    <article
      className={cn(
        'group relative rounded-xl bg-white border border-neutral-100 shadow-card',
        'hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 p-6',
        className
      )}
    >
      {service.emergency && (
        <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-brand-red border border-red-100">
          24/7
        </span>
      )}

      <div className={cn('inline-flex items-center justify-center rounded-xl p-3 mb-4', iconBg)}>
        <Icon className={cn('h-6 w-6', iconColor)} aria-hidden="true" />
      </div>

      <h3 className="font-bold text-navy-800 mb-2">{service.title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed mb-5">{service.shortDescription}</p>

      <Link
        href={`/services/${service.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue-light transition-colors group/link"
        aria-label={`Learn more about ${service.title}`}
      >
        Learn More
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </article>
  )
}
export default ServiceCard
