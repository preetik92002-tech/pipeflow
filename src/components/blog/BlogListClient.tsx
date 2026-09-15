'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, BookOpen, Calendar, Clock, ArrowRight, User, Phone, Sparkles } from 'lucide-react'
import { BlogCard } from './BlogCard'
import { siteConfig } from '@/lib/config/site'
import type { BlogPost, BlogCategory } from '@/lib/blog/types'

interface BlogListClientProps {
  initialPosts: BlogPost[]
  categories: BlogCategory[]
}

export function BlogListClient({ initialPosts, categories }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        post.categoryId === selectedCategory ||
        post.categorySlug === selectedCategory

      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesCategory && matchesSearch
    })
  }, [initialPosts, selectedCategory, searchQuery])

  const featuredPost = filteredPosts[0]
  const remainingPosts = filteredPosts.slice(1)
  const popularPosts = initialPosts.slice(0, 4)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-navy-900 text-white section-padding relative overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-blue/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 border border-brand-blue/30 px-3.5 py-1 text-xs font-bold text-brand-blue-lighter uppercase tracking-wider mb-4">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>The PipeFlow Journal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-4">
              Plumbing &amp; HVAC Wisdom for Colorado Homes
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-8">
              Straightforward diagnostic guides, winter freeze protocols, and heating &amp; cooling
              advice engineered for the unique climate of the Colorado Front Range.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles (e.g. frozen pipes, water heater, heat pump)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white/15 backdrop-blur-md text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="border-b border-neutral-200 bg-white sticky top-[72px] z-20 shadow-xs">
        <div className="container-site py-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="section-padding bg-neutral-50">
        <div className="container-site">
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-white border border-neutral-200 p-8 max-w-lg mx-auto shadow-sm">
              <Search className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-navy-900 mb-1">No Articles Found</h3>
              <p className="text-sm text-neutral-500 mb-5">
                We couldn&apos;t find any articles matching &ldquo;{searchQuery}&rdquo;. Try another
                keyword or clear your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="btn-outline text-xs"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Main Column (8 cols) */}
              <div className="lg:col-span-8 space-y-10">
                {/* Highlighted Lead / Featured Article */}
                {featuredPost && (
                  <article className="group rounded-3xl bg-white border border-neutral-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-neutral-100">
                        <Image
                          src={featuredPost.featuredImage || '/assets/service-detail-2.jpg'}
                          alt={featuredPost.featuredImageAlt || featuredPost.title}
                          fill
                          priority
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red text-white px-3 py-1 text-2xs font-bold uppercase tracking-wider shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            Featured
                          </span>
                        </div>
                      </div>

                      <div className="p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2.5 text-2xs text-neutral-400 mb-2">
                            <Calendar className="h-3 w-3" />
                            <time>
                              {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </time>
                            <span>&bull;</span>
                            <Clock className="h-3 w-3" />
                            <span>{featuredPost.readingTimeMinutes} min read</span>
                          </div>

                          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                            {featuredPost.categoryName}
                          </span>

                          <h2 className="text-2xl font-display font-bold text-navy-900 mt-1 mb-3 group-hover:text-brand-blue transition-colors leading-snug">
                            <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                          </h2>

                          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-6">
                            {featuredPost.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                          <span className="text-2xs font-medium text-neutral-500 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{featuredPost.author}</span>
                          </span>

                          <Link
                            href={`/blog/${featuredPost.slug}`}
                            className="btn-primary !py-2 !px-4 text-xs"
                          >
                            Read Full Guide
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                )}

                {/* Grid of Remaining Posts */}
                {remainingPosts.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                      <span className="h-1 w-6 rounded-full bg-brand-blue inline-block" />
                      Recent Articles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {remainingPosts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Column (4 cols) */}
              <aside className="lg:col-span-4 space-y-8">
                {/* Quick Emergency Dispatch Card */}
                <div className="rounded-3xl bg-navy-900 text-white p-6 sm:p-7 shadow-lg border border-navy-800">
                  <div className="w-10 h-10 rounded-xl bg-brand-red text-white flex items-center justify-center mb-4 shadow-sm">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Facing an Active Leak or No Heat?</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-5">
                    Don&apos;t wait for damage to spread. Our Denver dispatch crew is on call 24/7 for urgent residential plumbing &amp; furnace repairs.
                  </p>
                  <a
                    href={`tel:${siteConfig.company.phone}`}
                    className="btn-primary w-full !py-3 text-xs justify-center text-center shadow-sm"
                  >
                    Call Now: {siteConfig.company.phone}
                  </a>
                </div>

                {/* Most Read Articles */}
                <div className="rounded-3xl bg-white border border-neutral-200/80 p-6 shadow-card">
                  <h3 className="text-base font-bold text-navy-900 mb-4 pb-3 border-b border-neutral-100 uppercase tracking-wider text-xs">
                    Popular Guides
                  </h3>
                  <div className="space-y-4 divide-y divide-neutral-100">
                    {popularPosts.map((p, idx) => (
                      <article key={p.id} className={idx > 0 ? 'pt-4' : ''}>
                        <span className="text-2xs font-bold text-brand-blue uppercase tracking-wider">
                          {p.categoryName}
                        </span>
                        <h4 className="text-sm font-bold text-navy-900 hover:text-brand-blue transition-colors mt-0.5 leading-snug">
                          <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                        </h4>
                        <div className="flex items-center gap-2 text-2xs text-neutral-400 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{p.readingTimeMinutes} min read</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Direct Booking Promo */}
                <div className="rounded-3xl bg-blue-50/80 border border-blue-100 p-6 text-center">
                  <h3 className="text-base font-bold text-navy-900 mb-1">Need Scheduled Service?</h3>
                  <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                    Book an on-time diagnostic visit with fixed upfront pricing anywhere in the Denver area.
                  </p>
                  <Link href="/book-service" className="btn-outline !py-2 !px-5 text-xs w-full justify-center">
                    Book an Appointment
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default BlogListClient
