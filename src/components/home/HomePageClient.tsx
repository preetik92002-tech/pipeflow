'use client'

import { useState } from 'react'
import { Hero } from '@/components/sections/Hero'
import { EmergencyResponseStrip } from '@/components/sections/EmergencyResponseStrip'
import { ServiceSelector } from '@/components/sections/ServiceSelector'
import { TellUsForm } from '@/components/sections/TellUsForm'
import { TrustPrinciples } from '@/components/sections/TrustPrinciples'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { ServiceExperience } from '@/components/sections/ServiceExperience'
import { SpecialOffer } from '@/components/sections/SpecialOffer'
import { ReviewCarousel } from '@/components/sections/ReviewCarousel'
import { ServiceAreaChecker } from '@/components/sections/ServiceAreaChecker'
import { BlogPreview } from '@/components/sections/BlogPreview'
import { PartnerCTA } from '@/components/sections/PartnerCTA'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { FloatingVideo } from '@/components/video/FloatingVideo'
import { useBookingModal } from '@/components/booking/BookingModalProvider'
import { siteConfig } from '@/lib/config/site'

export function HomePageClient() {
  const [selectedCategory, setSelectedCategory] = useState<'plumbing' | 'hvac'>('plumbing')
  const { openModal } = useBookingModal()

  return (
    <>
      {/* 1. High-Impact Animated Hero with Service Chips */}
      <Hero onSelectCategory={(cat) => setSelectedCategory(cat)} onBookService={() => openModal()} />

      {/* 2. Fast-Response & Trust Strip */}
      <EmergencyResponseStrip />

      {/* 3. "What Do You Need Help With?" Service Selection */}
      <ServiceSelector
        activeCategory={selectedCategory}
        onCategoryChange={(cat) => setSelectedCategory(cat)}
      />

      {/* 4. High-Conversion Lead Capture Form ("Tell Us What’s Going On") */}
      <TellUsForm />

      {/* 5. Trust Principles ("Why Homeowners Choose PipeFlow") */}
      <TrustPrinciples />

      {/* 6. 4-Step Animated Process ("How It Works") */}
      <HowItWorks />

      {/* 7. Service Experience Editorial Section */}
      <ServiceExperience />

      {/* 8. Conversion Special Offer Banner */}
      <SpecialOffer />

      {/* 9. Verified Customer Reviews Carousel */}
      <ReviewCarousel testimonials={siteConfig.defaultTestimonials} />

      {/* 10. Service Areas & Interactive ZIP Availability Checker */}
      <ServiceAreaChecker />

      {/* 11. Blog Preview ("From the PipeFlow Journal") */}
      <BlogPreview />

      {/* 12. Join PipeFlow Secondary Pro Funnel */}
      <PartnerCTA />

      {/* 13. High-Impact Closing Conversion CTA */}
      <FinalCTA />

      {/* 14. Floating Mini Promotional Video Widget */}
      <FloatingVideo videoSrc="/assets/add.mp4" delayMs={2500} />
    </>
  )
}

export default HomePageClient
