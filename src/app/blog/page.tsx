import type { Metadata } from 'next'
import { BlogListClient } from '@/components/blog/BlogListClient'
import { blogService } from '@/lib/blog/blogService'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = genMeta({
  title: 'The PipeFlow Journal — Colorado Plumbing & HVAC Guides',
  description:
    'Expert plumbing, heating, and cooling advice for Denver homeowners. Prevent frozen pipes, explore heat pumps vs furnaces, and maintain your residential mechanical systems.',
  path: '/blog',
})

export default function BlogPage() {
  const posts = blogService.getPublishedPosts()
  const categories = blogService.getCategories()

  return <BlogListClient initialPosts={posts} categories={categories} />
}
