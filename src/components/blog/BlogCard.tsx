import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import type { BlogPost } from '@/lib/blog/types'
import { formatShortDate } from '@/lib/date'

interface BlogCardProps {
  post: BlogPost
  priority?: boolean
}

/**
 * Article card in the site's one card style. Phones: a compact row (thumbnail beside the title) so a list of posts
 * is not a stack of full-width photos. From 640px: thumbnail on top, excerpt and a read link below.
 */
export function BlogCard({ post, priority = false }: BlogCardProps) {
  const formattedDate = formatShortDate(post.publishedAt)

  return (
    <article className="ui-card group relative flex gap-4 overflow-hidden p-3 transition-shadow hover:shadow-card-hover sm:flex-col sm:gap-0 sm:p-0">
      <div className="relative h-24 w-28 flex-none overflow-hidden rounded-lg bg-mist sm:aspect-[16/10] sm:h-auto sm:w-full sm:rounded-none">
        <Image
          src={post.featuredImage || '/art/hero-plumbing.svg'}
          alt={post.featuredImageAlt || ''}
          fill
          priority={priority}
          className="object-cover object-center transition-transform duration-500 motion-safe:group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
        />
        <span className="absolute left-3 top-3 hidden rounded-full bg-ink/90 px-3 py-1 text-xs font-semibold text-white sm:inline-block">{post.categoryName}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col sm:p-6">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readingTimeMinutes} min read
          </span>
        </p>

        <h3 className="mt-1.5 line-clamp-3 font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-terra sm:mt-2 sm:line-clamp-2 sm:text-xl">
          {/* The whole card is the link target (the ::after covers it), so it is one tap stop. */}
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>

        <p className="ui-body mt-2 hidden flex-1 text-neutral-600 sm:block">
          <span className="line-clamp-3">{post.excerpt}</span>
        </p>

        <span className="mt-5 hidden items-center gap-1.5 border-t border-line pt-4 text-[0.95rem] font-semibold text-terra sm:inline-flex" aria-hidden="true">
          Read the article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}
export default BlogCard
