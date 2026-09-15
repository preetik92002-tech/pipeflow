import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config/site'
import { blogService } from '@/lib/blog/blogService'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/services/plumbing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/services/hvac`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/service-areas`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/book-service`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/get-a-quote`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/join-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  // Dynamic Service Detail Pages
  const serviceRoutes: MetadataRoute.Sitemap = siteConfig.defaultServices.map((service) => ({
    url: `${BASE_URL}/services/${service.category}/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  // Dynamic Location Landing Pages
  const areaRoutes: MetadataRoute.Sitemap = siteConfig.defaultServiceAreas
    .filter((area) => area.active)
    .map((area) => ({
      url: `${BASE_URL}/service-areas/${area.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

  // Dynamic Published Blog Articles (Excluding Drafts & Noindex)
  const publishedBlogs = blogService.getPublishedPosts()
  const blogRoutes: MetadataRoute.Sitemap = publishedBlogs
    .filter((post) => !post.noindex)
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.75,
    }))

  return [...staticRoutes, ...serviceRoutes, ...areaRoutes, ...blogRoutes]
}
