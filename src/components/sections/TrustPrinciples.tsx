'use client'

import {
  MessageSquare,
  Award,
  Clock,
  ShieldCheck,
  Home,
  CheckCircle2,
} from 'lucide-react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'message-square': MessageSquare,
  award: Award,
  clock: Clock,
  'shield-check': ShieldCheck,
  home: Home,
}

export function TrustPrinciples({ content }: { content: { title: string; description: string; iconName: string; active: boolean; order: number }[] }) {
  const principles = [...content].filter((item) => item.active).sort((a, b) => a.order - b.order).map((item, index) => ({ id: String(index), ...item }))
  if (principles.length === 0) return null

  return (
    <section
      className="section-padding bg-white border-b border-neutral-200/80 overflow-hidden relative"
      aria-labelledby="trust-heading"
    >
      <div className="container-site relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" distance={20} className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-2">
            The PipeFlow Standard
          </p>
          <h2
            id="trust-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight mb-4"
          >
            Why Homeowners Choose PipeFlow
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg">
            We built our Colorado service around integrity, clean craftsmanship, and genuine respect for your family&apos;s home.
          </p>
        </ScrollReveal>

        {/* 5 Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {principles.map((p, index) => {
            const Icon = iconMap[p.iconName] ?? CheckCircle2
            const isFifth = index === 4

            return (
              <ScrollReveal
                key={p.id}
                delay={index * 90}
                direction="up"
                distance={20}
                className={isFifth ? 'md:col-span-2 lg:col-span-1 h-full' : 'h-full'}
              >
                <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/50 p-6 sm:p-8 hover:bg-white hover:border-brand-blue/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mb-5 border border-blue-100/60 shadow-2xs">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-navy-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed flex-1">{p.description}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Homeowner Assurance Callout */}
        <ScrollReveal delay={300} direction="up" className="mt-12 rounded-2xl bg-blue-50/70 border border-blue-100 p-6 text-center max-w-3xl mx-auto shadow-2xs">
          <p className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
            Colorado Code Compliance &amp; Workmanship
          </p>
          <p className="text-sm text-neutral-700">
            Every repair and installation strictly adheres to local municipal codes in Denver, Arapahoe,
            Jefferson, Adams, and Douglas counties.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default TrustPrinciples
