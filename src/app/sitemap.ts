import type { MetadataRoute } from 'next'
import { getPublishedBlogs } from '@/lib/cms/queries'
import { listPublishedPaths } from '@/lib/cms-pages/repository'
import { pathToUrl } from '@/lib/cms-pages/paths'
import { getPublicSeoSettings } from '@/lib/seo/metadata'

// Fresh on every request so a publish or unpublish shows up immediately.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, blogs, seo] = await Promise.all([listPublishedPaths(), getPublishedBlogs(), getPublicSeoSettings()])
  const baseUrl = seo?.canonical_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'
  return [
    // Drafts, unpublished pages, templates and noindex pages never appear here.
    ...pages
      .filter((p) => !p.noindex)
      .map((p) => ({
        url: p.path === '' ? baseUrl : `${baseUrl}${pathToUrl(p.path)}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: p.path === '' ? 1 : p.path.includes('/') ? 0.8 : 0.9,
      })),
    ...['/book-service', '/about', '/blog', '/contact', '/join-us'].map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...blogs.filter((blog) => !blog.noindex).map((blog) => ({ url: `${baseUrl}/blog/${blog.slug}`, lastModified: new Date(blog.updated_at), changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]
}
