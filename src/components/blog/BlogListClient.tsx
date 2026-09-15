'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, BookOpen, Calendar, Clock, ArrowRight, User, Phone, Sparkles } from 'lucide-react'
import { BlogCard } from './BlogCard'
import { siteConfig } from '@/lib/config/site'
import type { BlogPost, BlogCategory } from '@/lib/blog/types'
import { PageHero } from '@/components/sections/PageHero'

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
      {/* Cinematic Blog Hero */}
      <PageHero
        imageSrc="/assets/hero-blog.jpg"
        imageAlt="PipeFlow plumbing and HVAC research station with notebook, tools, and Denver skyline backdrop"
        eyebrow="PipeFlow Resources"
        eyebrowIcon={BookOpen}
        title="Plumbing & HVAC insights for your Colorado home."
        description="Straightforward diagnostic guides, winter freeze protocols, and heating & cooling advice engineered for the unique climate of the Colorado Front Range."
        primaryCta={{
          label: 'Book a Service',
          href: '/book-service',
          variant: 'red',
          icon: Calendar,
        }}
        secondaryCta={{
          label: 'Get Free Estimate',
          href: '/get-a-quote',
          variant: 'outline',
          icon: Sparkles,
        }}
        badgeText="Updated Weekly by Licensed Colorado Master Technicians"
      />

      {/* Main Content Area */}
      <div className="section-padding container-site">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-8 mb-12 border-b border-neutral-200">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Articles ({initialPosts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
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
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </div>

        {/* Featured Post Card (if available and not filtered out) */}
        {featuredPost && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-16">
            <div className="bg-navy-900 text-white rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 border border-navy-800">
              <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px]">
                <Image
                  src={featuredPost.featuredImage}
                  alt={featuredPost.featuredImageAlt || featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-red text-white px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider shadow-md">
                    Featured Insight
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-2xs text-neutral-400 mb-3">
                    <span className="bg-navy-800 text-brand-blue-lighter px-2.5 py-0.5 rounded-md font-semibold">
                      {featuredPost.categoryName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {featuredPost.readingTimeMinutes} min read
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-3 hover:text-brand-blue-lighter transition-colors">
                    <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-300 line-clamp-3 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-navy-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="text-xs font-bold text-brand-blue-lighter hover:text-white flex items-center gap-1.5"
                  >
                    <span>Read Full Guide</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === 'all' && !searchQuery ? remainingPosts : filteredPosts).map(
                (post) => (
                  <BlogCard key={post.id} post={post} />
                )
              )}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-neutral-50 rounded-3xl border border-neutral-200">
            <BookOpen className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-display text-navy-900">No Guides Match Your Search</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto mb-6">
              Try adjusting your query or clear the filter to browse all Colorado home insights.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="btn-outline !py-2 !px-4 text-xs"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Newsletter / Direct Inquiry Bar */}
      <section className="bg-navy-950 text-white py-14 border-t border-navy-800">
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Have a Specific Mechanical Problem in Your Home?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Our master plumbers and HVAC mechanics provide direct diagnostics, system load calculations, and upfront estimates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/book-service" className="btn-primary !py-3 !px-6 text-xs bg-brand-red hover:bg-brand-red-dark">
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Inspection</span>
            </Link>
            <a href={`tel:${siteConfig.company.phone}`} className="btn-outline !py-3 !px-5 text-xs text-white border-white/30">
              <Phone className="h-3.5 w-3.5" />
              <span>{siteConfig.company.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
