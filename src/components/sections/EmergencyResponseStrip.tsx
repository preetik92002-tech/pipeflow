'use client'

import { Clock, ShieldCheck, MessageSquare, MapPin, Wrench } from 'lucide-react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

interface EmergencyResponseStripProps {
  items?: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    subtitle: string
  }[]
}

const defaultStripItems = [
  {
    icon: Clock,
    title: 'Same-Day Service',
    subtitle: 'Fast dispatch for urgent repairs',
  },
  {
    icon: ShieldCheck,
    title: 'Licensed Professionals',
    subtitle: 'Vetted, certified technicians',
  },
  {
    icon: MessageSquare,
    title: 'Upfront Communication',
    subtitle: 'Clear pricing before work begins',
  },
  {
    icon: MapPin,
    title: 'Local Colorado Service',
    subtitle: 'Serving Denver metro communities',
  },
  {
    icon: Wrench,
    title: 'Plumbing + HVAC',
    subtitle: 'Complete residential care',
  },
]

export function EmergencyResponseStrip({ items = defaultStripItems }: EmergencyResponseStripProps) {
  return (
    <section
      aria-label="Fast Response & Trust Signals"
      className="bg-navy-900 border-t border-navy-700/60 border-b border-navy-800 shadow-sm relative z-10"
    >
      <div className="container-site py-5 sm:py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 divide-y md:divide-y-0 divide-navy-700/50">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <ScrollReveal
                key={item.title}
                delay={index * 100}
                direction="up"
                distance={16}
                className={`flex items-center gap-3 pt-3 md:pt-0 ${
                  index === 4 ? 'col-span-2 md:col-span-1' : ''
                }`}
              >
                <div className="rounded-xl bg-brand-blue/15 border border-brand-blue/30 p-2.5 flex-shrink-0 text-brand-blue-lighter group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-snug">{item.title}</p>
                  <p className="text-xs text-neutral-300 leading-tight mt-0.5">{item.subtitle}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default EmergencyResponseStrip
