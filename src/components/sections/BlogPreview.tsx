'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, Calendar } from 'lucide-react'
import { siteConfig } from '@/lib/config/site'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

export function BlogPreview() {
  const posts = siteConfig.defaultBlogPosts.filter((p) => p.published).slice(0, 3)

  if (posts.length === 0) return null

  return (
    <section
      className="section-padding bg-neutral-50 border-b border-neutral-200/80 relative overflow-hidden"
      aria-labelledby="journal-heading"
    >
      <div className="container-site relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
          <ScrollReveal direction="up" distance={20}>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Expert Knowledge</span>
            </div>
            <h2
              id="journal-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight"
            >
              From the PipeFlow Journal
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-xl">
              Practical maintenance tips, cold-weather protection guides, and mechanical insights for Colorado homeowners.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100} direction="up">
            <Link
              href="/blog"
              className="btn-outline !py-2.5 !px-5 text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 hover:shadow-sm"
            >
              <span>View All Articles</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post, index) => (
            <ScrollReveal
              key={post.id}
              delay={index * 100}
              direction="up"
              distance={24}
              className="h-full"
            >
              <article className="group flex flex-col rounded-3xl bg-white border border-neutral-200/80 overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 h-full">
                {/* Image */}
                {post.imageUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-navy-900/90 text-white px-3 py-1 text-2xs font-bold uppercase tracking-wider backdrop-blur-xs shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-2xs text-neutral-400 mb-2.5">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      <time>{post.publishedAt}</time>
                    </div>

                    <h3 className="text-lg font-bold font-heading text-navy-900 mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-dark transition-colors pt-4 border-t border-neutral-100"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogPreview
