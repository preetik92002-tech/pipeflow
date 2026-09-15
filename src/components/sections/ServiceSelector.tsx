'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Droplets,
  Wind,
  Flame,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Phone,
  CheckCircle2,
  X,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { cn } from '@/lib/cn'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { AnimatedServiceCard } from './AnimatedServiceCard'
import type { Service } from '@/types'

interface ServiceSelectorProps {
  activeCategory?: 'plumbing' | 'hvac'
  onCategoryChange?: (category: 'plumbing' | 'hvac') => void
}

export function ServiceSelector({
  activeCategory: controlledCategory,
  onCategoryChange,
}: ServiceSelectorProps) {
  const [internalCategory, setInternalCategory] = useState<'plumbing' | 'hvac'>('plumbing')
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<Service | null>(null)

  const activeCategory = controlledCategory ?? internalCategory

  const handleTabClick = (cat: 'plumbing' | 'hvac') => {
    if (onCategoryChange) {
      onCategoryChange(cat)
    } else {
      setInternalCategory(cat)
    }
  }

  const displayedServices = siteConfig.defaultServices.filter(
    (s) => s.category === activeCategory
  )

  return (
    <section
      id="services"
      className="section-padding bg-neutral-50 scroll-mt-20 relative overflow-hidden"
      aria-labelledby="help-heading"
    >
      <div className="container-site relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" distance={20} className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-2">
            Residential Home Solutions
          </p>
          <h2
            id="help-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight mb-4"
          >
            What Do You Need Help With?
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg">
            Select plumbing or HVAC below to explore our licensed Colorado home services and book immediate assistance.
          </p>
        </ScrollReveal>

        {/* Category Switcher Tabs */}
        <ScrollReveal delay={150} direction="up" distance={15} className="flex justify-center mb-10">
          <div
            role="tablist"
            aria-label="Service Category Switcher"
            className="inline-flex rounded-2xl bg-neutral-200/80 p-1.5 shadow-inner"
          >
            <button
              role="tab"
              aria-selected={activeCategory === 'plumbing'}
              aria-controls="plumbing-panel"
              id="tab-plumbing"
              onClick={() => handleTabClick('plumbing')}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm sm:text-base font-bold transition-all duration-200',
                activeCategory === 'plumbing'
                  ? 'bg-white text-navy-900 shadow-md scale-100'
                  : 'text-neutral-600 hover:text-navy-900 hover:bg-white/50'
              )}
            >
              <Droplets
                className={cn(
                  'h-5 w-5',
                  activeCategory === 'plumbing' ? 'text-brand-blue' : 'text-neutral-500'
                )}
                aria-hidden="true"
              />
              <span>Plumbing Services (6)</span>
            </button>

            <button
              role="tab"
              aria-selected={activeCategory === 'hvac'}
              aria-controls="hvac-panel"
              id="tab-hvac"
              onClick={() => handleTabClick('hvac')}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-6 py-3 text-sm sm:text-base font-bold transition-all duration-200',
                activeCategory === 'hvac'
                  ? 'bg-white text-navy-900 shadow-md scale-100'
                  : 'text-neutral-600 hover:text-navy-900 hover:bg-white/50'
              )}
            >
              <Flame
                className={cn(
                  'h-5 w-5',
                  activeCategory === 'hvac' ? 'text-brand-red' : 'text-neutral-500'
                )}
                aria-hidden="true"
              />
              <span>HVAC Heating &amp; Cooling (6)</span>
            </button>
          </div>
        </ScrollReveal>

        {/* 6 Services Grid with Staggered Entrance */}
        <div
          id={`${activeCategory}-panel`}
          role="tabpanel"
          aria-labelledby={`tab-${activeCategory}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {displayedServices.map((service, index) => (
            <ScrollReveal
              key={service.id}
              delay={index * 80}
              direction="up"
              distance={20}
              className="h-full"
            >
              <AnimatedServiceCard
                service={service}
                onOpenModal={(srv) => setSelectedServiceForModal(srv)}
              />
            </ScrollReveal>
          ))}
        </div>

        {/* View All Services Direct Link */}
        <ScrollReveal delay={300} direction="up" className="mt-12 text-center">
          <Link
            href={`/services/${activeCategory}`}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white px-6 py-3 text-sm font-bold shadow-sm transition-all hover:gap-3"
          >
            <span>View All {activeCategory === 'plumbing' ? 'Plumbing' : 'HVAC'} Solutions</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </ScrollReveal>
      </div>

      {/* Quick Service Details Modal */}
      {selectedServiceForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="absolute inset-0"
            onClick={() => setSelectedServiceForModal(null)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl z-10 animate-slide-up border border-neutral-200">
            <button
              type="button"
              onClick={() => setSelectedServiceForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-navy-900 hover:bg-neutral-100 transition-colors"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span
                className={cn(
                  'p-3 rounded-2xl text-white',
                  selectedServiceForModal.category === 'hvac' ? 'bg-brand-red' : 'bg-brand-blue'
                )}
              >
                {selectedServiceForModal.category === 'hvac' ? (
                  <Flame className="h-6 w-6" />
                ) : (
                  <Droplets className="h-6 w-6" />
                )}
              </span>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400">
                  {selectedServiceForModal.category} Service
                </span>
                <h3 id="modal-title" className="text-xl font-bold font-heading text-navy-900">
                  {selectedServiceForModal.title}
                </h3>
              </div>
            </div>

            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
              {selectedServiceForModal.description || selectedServiceForModal.shortDescription}
            </p>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 mb-6 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-navy-900 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Licensed Master Technician Diagnostic</span>
              </div>
              <div className="flex items-center gap-2 text-navy-900 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-brand-blue" />
                <span>Upfront Written Estimate Before Any Work Begins</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={siteConfig.ctas.bookService.href}
                onClick={() => setSelectedServiceForModal(null)}
                className="btn-primary !py-3 !text-sm flex-1 justify-center"
              >
                <Calendar className="h-4 w-4" />
                <span>Book This Service</span>
              </Link>
              <Link
                href={`/services/${selectedServiceForModal.category}/${selectedServiceForModal.slug}`}
                onClick={() => setSelectedServiceForModal(null)}
                className="btn-outline !py-3 !text-sm flex-1 justify-center"
              >
                <span>Full Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ServiceSelector
