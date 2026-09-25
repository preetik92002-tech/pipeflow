'use client'

import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { AnimatedProcessSteps } from './AnimatedProcessSteps'

export function HowItWorks({ content }: { content: { heading: string; description: string; active: boolean; steps: { title: string; description: string; order: number }[] } }) {
  if (!content.active) return null
  return (
    <section
      className="section-padding bg-neutral-50 border-b border-neutral-200/80 overflow-hidden relative"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container-site relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" distance={20} className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-2">
            Seamless 4-Step Experience
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight mb-4"
          >
            {content.heading}
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg">
            {content.description}
          </p>
        </ScrollReveal>

        {/* Animated Step Progression */}
        <AnimatedProcessSteps content={content.steps} />
      </div>
    </section>
  )
}

export default HowItWorks
