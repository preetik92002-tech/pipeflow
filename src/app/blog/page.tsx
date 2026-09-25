import type { Metadata } from 'next'
import { BlogListClient } from '@/components/blog/BlogListClient'
import { getPublishedBlogs, toBlogPosts } from '@/lib/cms/queries'
import type { BlogCategory } from '@/lib/blog/types'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  return genMeta({
  title: 'The PipeFlow Journal — Colorado Plumbing & HVAC Guides',
  description:
    'Expert plumbing, heating, and cooling advice for Denver homeowners. Prevent frozen pipes, explore heat pumps vs furnaces, and maintain your residential mechanical systems.',
  path: '/blog',
  })
}

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const posts = toBlogPosts(await getPublishedBlogs())
  const categories: BlogCategory[] = Array.from(new Map(posts.map((post) => [post.categorySlug, {
    id: post.categorySlug, name: post.categoryName, slug: post.categorySlug, sortOrder: 0,
  }])).values())

  return <BlogListClient initialPosts={posts} categories={categories} />
}
