import type { MetadataRoute } from 'next'
import { getPublishedBlogs, getServiceAreas, getServices } from '@/lib/cms/queries'

export const dynamic = 'force-dynamic'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, areas, blogs] = await Promise.all([getServices(), getServiceAreas(), getPublishedBlogs()])
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    ...['/services','/services/plumbing','/services/hvac','/service-areas','/about','/blog','/book-service','/get-a-quote','/join-us','/contact'].map((path) => ({ url: `${BASE_URL}${path}`, changeFrequency: 'weekly' as const, priority: path === '/services' || path === '/blog' ? 0.9 : 0.7 })),
  ]
  return [
    ...staticRoutes,
    ...services.map((service) => ({ url: `${BASE_URL}/services/${service.category}/${service.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...areas.map((area) => ({ url: `${BASE_URL}/service-areas/${area.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...blogs.filter((blog) => !blog.noindex).map((blog) => ({ url: `${BASE_URL}/blog/${blog.slug}`, lastModified: new Date(blog.updated_at), changeFrequency: 'monthly' as const, priority: 0.75 })),
  ]
}
