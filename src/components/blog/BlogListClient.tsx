'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { hasRealPhone } from '@/lib/config/contact'
import Link from 'next/link'
import { Search, BookOpen, Calendar, Clock, ArrowRight, User, Phone, Sparkles } from 'lucide-react'
import { BlogCard } from './BlogCard'
import { useSiteSettings } from '@/components/layout/SiteSettingsProvider'
import type { BlogPost, BlogCategory } from '@/lib/blog/types'
import { PageHero } from '@/components/sections/PageHero'

interface BlogListClientProps {
  initialPosts: BlogPost[]
  categories: BlogCategory[]
}

export function BlogListClient({ initialPosts, categories }: BlogListClientProps) {
  const { company } = useSiteSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory = selectedCategory === 'all' || post.categoryId === selectedCategory || post.categorySlug === selectedCategory

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
      {/* Cinematic Blog Hero */}
      <PageHero
        imageSrc="/images/hero/blog.jpg"
        imageAlt=""
        eyebrow="PipeFlow Resources"
        eyebrowIcon={BookOpen}
        title="Plumbing & HVAC insights for your Colorado home."
        description="Plain-English guides to frozen pipes, water heaters, heating and cooling for Front Range homes."
        primaryCta={{
          label: 'Book a Service',
          href: '/book-service',
          variant: 'red',
          icon: Calendar,
        }}
        secondaryCta={{
          label: 'Find a Local Pro',
          href: '/find-a-pro',
          variant: 'outline',
          icon: Sparkles,
        }}
        badgeText="Plumbing & HVAC guides for Denver & Boulder"
      />

      {/* Main Content Area */}
      <div className="section-y container-site">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-line lg:mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 text-[0.95rem] font-semibold transition-colors shrink-0 ${selectedCategory === 'all' ? 'bg-ink text-white shadow-sm' : 'bg-mist text-neutral-600 hover:bg-neutral-200'}`}
            >
              All Articles ({initialPosts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex min-h-[2.75rem] items-center rounded-full px-4 text-[0.95rem] font-semibold transition-colors shrink-0 ${selectedCategory === cat.id ? 'bg-ink text-white shadow-sm' : 'bg-mist text-neutral-600 hover:bg-neutral-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides & solutions..."
              aria-label="Search guides" className="min-h-[2.75rem] w-full rounded-lg border border-field/50 pl-9 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-terra"
            />
          </div>
        </div>

        {/* Featured Post Card (if available and not filtered out) */}
        {featuredPost && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-8 lg:mb-12">
            <div className="grid grid-cols-1 overflow-hidden rounded-xl bg-ink text-white lg:grid-cols-12">
              <div className="lg:col-span-7 relative aspect-[2/1] lg:aspect-auto lg:min-h-[400px]">
                <Image src={featuredPost.featuredImage} alt={featuredPost.featuredImageAlt || featuredPost.title} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-terra px-3 py-1 text-xs font-semibold text-white">Featured guide</span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3 text-sm text-white/70">
                    <span className="font-semibold text-terra-light">{featuredPost.categoryName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {featuredPost.readingTimeMinutes} min read
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-3 hover:text-terra-light transition-colors">
                    <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h2>

                  <p className="mb-6 line-clamp-3 text-base leading-relaxed text-white/80">{featuredPost.excerpt}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/15 pt-5">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <Link href={`/blog/${featuredPost.slug}`} className="flex min-h-[2.75rem] items-center gap-1.5 text-[0.95rem] font-semibold text-terra-light hover:text-white">
                    <span>Read the guide</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {filteredPosts.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {(selectedCategory === 'all' && !searchQuery ? remainingPosts : filteredPosts).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-paper py-14 text-center">
            <BookOpen className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-display text-ink">No Guides Match Your Search</h3>
            <p className="ui-body mx-auto mb-6 mt-1 max-w-sm text-neutral-600">Try adjusting your query or clear the filter to browse all Colorado home insights.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="ui-btn ui-btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Newsletter / Direct Inquiry Bar */}
      <section className="bg-ink py-10 text-white sm:py-14">
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">Have a Plumbing or HVAC Problem?</h3>
            <p className="mt-2 max-w-xl text-base text-white/80">Tell us what you need and we will help you find a local professional serving Denver or Boulder.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/book-service" className="ui-btn ui-btn-primary">
              <Calendar className="h-3.5 w-3.5" />
              <span>Request Service</span>
            </Link>
            {hasRealPhone(company.phone) && (
              <a href={`tel:${company.phone}`} className="ui-btn ui-btn-on-dark">
                <Phone className="h-3.5 w-3.5" />
                <span>{company.phone}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
