'use client'

import React from 'react'
import { ClipboardList, Calendar, Wrench, Smile, CheckCircle2, ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'clipboard-list': ClipboardList,
  calendar: Calendar,
  wrench: Wrench,
  smile: Smile,
}

export function AnimatedProcessSteps() {
  const steps = siteConfig.defaultHowItWorks

  return (
    <div className="relative">
      {/* Desktop Animated Connecting Line */}
      <div
        className="hidden lg:block absolute top-12 left-16 right-16 h-1 bg-gradient-to-r from-brand-blue/30 via-brand-blue to-emerald-500 rounded-full z-0 opacity-80"
        aria-hidden="true"
      />

      {/* Desktop Grid / Mobile Vertical Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
        {steps.map((item, index) => {
          const Icon = iconMap[item.iconName] ?? Wrench

          return (
            <ScrollReveal
              key={item.step}
              delay={index * 140}
              direction="up"
              distance={24}
              className="h-full"
            >
              <div className="relative flex flex-col items-start lg:items-center text-left lg:text-center rounded-3xl bg-white border border-neutral-200/80 p-6 sm:p-7 shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group h-full justify-between">
                <div>
                  {/* Step Number & Icon */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center shadow-lg group-hover:bg-brand-blue group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-7 w-7 text-brand-blue-lighter group-hover:text-white transition-colors" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-red text-white text-xs font-black flex items-center justify-center shadow-md ring-4 ring-white">
                      {item.step}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-navy-900 mb-2.5 group-hover:text-brand-blue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Subtitle / Step Progress Indicator */}
                <div className="pt-4 mt-4 border-t border-neutral-100 w-full flex items-center justify-between text-2xs text-neutral-400 font-semibold uppercase tracking-wider">
                  <span>Step {item.step} of 4</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </div>
  )
}

export default AnimatedProcessSteps
