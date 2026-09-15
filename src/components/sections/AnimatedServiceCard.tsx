'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Droplets,
  Flame,
  Search,
  Wind,
  Thermometer,
  AlertTriangle,
  Wrench,
  Zap,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Service } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  search: Search,
  droplets: Droplets,
  flame: Flame,
  wrench: Wrench,
  zap: Zap,
  'alert-triangle': AlertTriangle,
  wind: Wind,
  thermometer: Thermometer,
}

interface AnimatedServiceCardProps {
  service: Service
  onOpenModal?: (service: Service) => void
  imageSrc?: string
  priority?: boolean
}

export function AnimatedServiceCard({
  service,
  onOpenModal,
  imageSrc,
}: AnimatedServiceCardProps) {
  const Icon = iconMap[service.iconName] ?? Wrench
  const isHVAC = service.category === 'hvac'
  const isEmergency = service.emergency

  const defaultImage = isHVAC
    ? '/assets/service-detail-1.jpg'
    : service.slug === 'drain-cleaning'
    ? '/assets/service-detail-2.jpg'
    : '/assets/service-plumbing.jpg'

  const finalImage = imageSrc || defaultImage

  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between rounded-3xl bg-white border border-neutral-200/80 shadow-card overflow-hidden',
        'hover:shadow-xl hover:border-brand-blue/40 transition-all duration-300 hover:-translate-y-1.5'
      )}
    >
      {/* Top Image Box with Subtle Hover Zoom */}
      <div className="relative aspect-[16/10] w-full bg-neutral-100 overflow-hidden">
        <Image
          src={finalImage}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />

        {/* Emergency Badge */}
        {isEmergency && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-brand-red px-2.5 py-1 text-2xs font-bold text-white shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            24/7 Dispatch
          </span>
        )}

        {/* Icon Floating Badge */}
        <div
          className={cn(
            'absolute bottom-3 left-3 rounded-xl p-2.5 text-white backdrop-blur-md shadow-md transition-transform group-hover:scale-110',
            isHVAC ? 'bg-brand-red/90' : 'bg-brand-blue/90'
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-heading font-bold text-navy-900 text-lg sm:text-xl mb-2 group-hover:text-brand-blue transition-colors">
            {service.title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-2">
            {service.shortDescription}
          </p>
        </div>

        {/* Action Row */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
          <Link
            href={`/services/${service.category}/${service.slug}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-navy-900 group-hover:text-brand-blue transition-colors"
          >
            <span>Explore Service</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 text-brand-blue" />
          </Link>

          {onOpenModal && (
            <button
              type="button"
              onClick={() => onOpenModal(service)}
              className="inline-flex items-center gap-1 text-2xs font-semibold text-neutral-500 hover:text-brand-blue p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Quick Details"
              aria-label={`View quick summary for ${service.title}`}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Details</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default AnimatedServiceCard
