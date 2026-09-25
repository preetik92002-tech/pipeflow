'use client'

import { useState } from 'react'
import type { FAQ, Service, ServiceArea, Testimonial } from '@/types'
import type { BlogPost } from '@/lib/blog/types'
import type { HomepageContent } from '@/lib/cms/types'
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
import { ServiceAreaSection } from '@/components/sections/ServiceAreaSection'
import { BlogPreview } from '@/components/sections/BlogPreview'
import { PartnerCTA } from '@/components/sections/PartnerCTA'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { FAQSection } from '@/components/sections/FAQSection'
import { StatsCounter } from '@/components/sections/StatsCounter'
import { FloatingVideo } from '@/components/video/FloatingVideo'

interface HomePageClientProps {
  content: HomepageContent
  services: Service[]
  areas: ServiceArea[]
  testimonials: Testimonial[]
  faqs: FAQ[]
  blogPosts: BlogPost[]
}

export function HomePageClient({ content, services, areas, testimonials, faqs, blogPosts }: HomePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<'plumbing' | 'hvac'>('plumbing')

  return <>
    <Hero content={content.hero} />
    <EmergencyResponseStrip />
    {content.services.active && <ServiceSelector activeCategory={selectedCategory} onCategoryChange={setSelectedCategory} services={services} heading={content.services.heading} description={content.services.description} />}
    <TellUsForm services={services} />
    <TrustPrinciples content={content.trust} />
    <StatsCounter stats={content.stats} />
    <HowItWorks content={content.process} />
    <ServiceExperience />
    <SpecialOffer content={content.promotion} />
    <ReviewCarousel testimonials={testimonials} />
    <ServiceAreaChecker areas={areas} />
    {content.serviceAreas.active && <ServiceAreaSection areas={areas} heading={content.serviceAreas.heading} description={content.serviceAreas.description} />}
    <BlogPreview posts={blogPosts} />
    <PartnerCTA />
    <FAQSection faqs={faqs} heading={content.faqHeading} description={content.faqDescription} />
    <FinalCTA content={content.finalCta} />
    <FloatingVideo videoSrc="/assets/add.mp4" delayMs={2500} />
  </>
}

export default HomePageClient
