import type { MetadataRoute } from 'next'
import { getPublishedBlogs, getServiceAreas, getServices } from '@/lib/cms/queries'
import { getPublicSeoSettings } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, areas, blogs, seo] = await Promise.all([getServices(), getServiceAreas(), getPublishedBlogs(), getPublicSeoSettings()])
  const baseUrl = seo?.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    ...['/services','/services/plumbing','/services/hvac','/service-areas','/about','/blog','/book-service','/get-a-quote','/join-us','/contact'].map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: 'weekly' as const, priority: path === '/services' || path === '/blog' ? 0.9 : 0.7 })),
  ]
  return [
    ...staticRoutes,
    ...services.map((service) => ({ url: `${baseUrl}/services/${service.category}/${service.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...areas.map((area) => ({ url: `${baseUrl}/service-areas/${area.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...blogs.filter((blog) => !blog.noindex).map((blog) => ({ url: `${baseUrl}/blog/${blog.slug}`, lastModified: new Date(blog.updated_at), changeFrequency: 'monthly' as const, priority: 0.75 })),
  ]
}
