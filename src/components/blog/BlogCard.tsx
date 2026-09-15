import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import type { BlogPost } from '@/lib/blog/types'

interface BlogCardProps {
  post: BlogPost
  priority?: boolean
}

export function BlogCard({ post, priority = false }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="group flex flex-col rounded-2xl bg-white border border-neutral-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* Featured Image */}
      <Link
        href={`/blog/${post.slug}`}
        className="relative aspect-[16/10] overflow-hidden bg-neutral-100 block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={post.featuredImage || '/assets/service-plumbing.jpg'}
          alt={post.featuredImageAlt || post.title}
          fill
          priority={priority}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4">
          <span className="rounded-full bg-navy-900/90 text-white px-3 py-1 text-2xs font-bold uppercase tracking-wider backdrop-blur-xs">
            {post.categoryName}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Meta Header */}
        <div className="flex items-center gap-3 text-2xs text-neutral-400 mb-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{post.readingTimeMinutes} min read</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-navy-900 mb-2 group-hover:text-brand-blue transition-colors line-clamp-2 leading-snug">
          <Link href={`/blog/${post.slug}`} className="focus-visible:outline-2 focus-visible:outline-brand-blue">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        {/* Author & CTA Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-auto">
          <span className="text-2xs text-neutral-500 flex items-center gap-1.5 font-medium truncate max-w-[160px]">
            <User className="h-3 w-3 text-neutral-400 flex-shrink-0" />
            <span className="truncate">{post.author}</span>
          </span>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue group-hover:text-brand-blue-light transition-colors"
            aria-label={`Read article: ${post.title}`}
          >
            <span>Read Article</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  )
}
export default BlogCard
