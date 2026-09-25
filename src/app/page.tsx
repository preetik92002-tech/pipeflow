import type { Metadata } from 'next'
import { HomePageClient } from '@/components/home/HomePageClient'
import { generateMetadata as genMeta, getPublicSeoSettings } from '@/lib/seo/metadata'
import { getHomepageContent, getHomepageFaqs, getHomepageTestimonials, getPublishedBlogs, getServiceAreas, getServices, toBlogPosts, toSiteService, toSiteServiceArea } from '@/lib/cms/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSeoSettings()
  return genMeta({
    title: settings?.homepage_title || 'Reliable Plumbing & HVAC Service When You Need It — Denver, CO',
    description: settings?.homepage_description || 'PipeFlow Co. provides licensed plumbing and HVAC services across Denver, Aurora, Lakewood, and surrounding Colorado communities. Same-day service, upfront pricing, and 24/7 emergency dispatch.',
    path: '/',
  })
}

export default async function HomePage() {
  const content = await getHomepageContent()
  const [serviceRows, areaRows, testimonials, faqs, blogRows] = await Promise.all([
    getServices(undefined, content.services.ids),
    getServiceAreas(content.serviceAreas.slugs),
    getHomepageTestimonials(content.testimonialIds),
    getHomepageFaqs(content.faqIds),
    getPublishedBlogs(),
  ])
  return <HomePageClient content={content} services={serviceRows.map(toSiteService)} areas={areaRows.map(toSiteServiceArea)} testimonials={testimonials} faqs={faqs} blogPosts={toBlogPosts(blogRows)} />
}
