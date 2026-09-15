import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  User,
  Share2,
  ChevronRight,
  Phone,
  CalendarDays,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { blogService } from '@/lib/blog/blogService'
import { siteConfig } from '@/lib/config/site'
import { Accordion } from '@/components/ui/Accordion'
import { BlogCard } from '@/components/blog/BlogCard'
import { generateMetadata as genMeta } from '@/lib/seo/metadata'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = blogService.getPublishedPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogService.getPostBySlug(slug)

  if (!post) {
    return { title: 'Article Not Found | PipeFlow Co.' }
  }

  return genMeta({
    title: post.seoTitle || `${post.title} | PipeFlow Journal`,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.ogImage || post.featuredImage,
    noIndex: Boolean(post.noindex),
  })
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = blogService.getPostBySlug(slug)

  if (!post || post.status !== 'published') {
    notFound()
  }

  const relatedPosts = blogService.getRelatedPosts(post.slug, post.categoryId, 3)

  // JSON-LD Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage
      ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'}${post.featuredImage}`
      : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'}/assets/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pipeflowco.com'}/blog/${post.slug}`,
    },
  }

  const formattedPublished = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedUpdated = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <article className="min-h-screen bg-white" aria-labelledby="article-title">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumbs Header */}
      <div className="bg-neutral-50 border-b border-neutral-200/80 py-3.5">
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="text-xs text-neutral-500">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href="/" className="hover:text-navy-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-neutral-400" />
              </li>
              <li>
                <Link href="/blog" className="hover:text-navy-900 transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <ChevronRight className="h-3 w-3 text-neutral-400" />
              </li>
              <li>
                <span className="text-navy-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
                  {post.categoryName}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <header className="container-site pt-10 pb-8 max-w-4xl mx-auto">
        {/* Category & Trade Pill */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="rounded-full bg-blue-50 text-brand-blue border border-blue-200 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            {post.categoryName}
          </span>
          {post.ctaType === 'emergency' && (
            <span className="rounded-full bg-red-50 text-brand-red border border-red-200 px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Urgent Guide
            </span>
          )}
        </div>

        {/* Headline */}
        <h1
          id="article-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight leading-[1.15] mb-5"
        >
          {post.title}
        </h1>

        {/* Lead Excerpt */}
        <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal mb-8 border-l-4 border-brand-blue pl-4">
          {post.excerpt}
        </p>

        {/* Author & Publication Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-neutral-200/80 text-xs text-neutral-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <User className="h-5 w-5 text-brand-blue-lighter" />
            </div>
            <div>
              <p className="font-bold text-navy-900 text-sm">{post.author}</p>
              <p className="text-2xs text-neutral-500">{post.authorRole || 'PipeFlow Colorado Specialist'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Published: {formattedPublished}</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{post.readingTimeMinutes} min read</span>
            </span>
            {formattedUpdated && (
              <>
                <span className="hidden md:inline">&bull;</span>
                <span className="hidden md:inline text-neutral-400">Updated: {formattedUpdated}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Featured Photograph */}
      <div className="container-site max-w-4xl mx-auto mb-12">
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-xl bg-neutral-100 border border-neutral-200/60">
          <Image
            src={post.featuredImage || '/assets/service-plumbing.jpg'}
            alt={post.featuredImageAlt || post.title}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>
        {post.featuredImageAlt && (
          <p className="text-2xs text-neutral-500 text-center mt-2 italic">
            {post.featuredImageAlt}
          </p>
        )}
      </div>

      {/* Article Content Body */}
      <div className="container-site max-w-3xl mx-auto pb-16">
        <div className="prose prose-lg prose-navy max-w-none text-neutral-700 leading-relaxed">
          {post.body.split('\n\n').map((block, index) => {
            if (block.startsWith('### ')) {
              return (
                <h2
                  key={index}
                  className="text-2xl font-display font-bold text-navy-900 mt-8 mb-4 border-b border-neutral-100 pb-2"
                >
                  {block.replace('### ', '')}
                </h2>
              )
            }
            if (block.startsWith('---')) {
              return <hr key={index} className="my-8 border-neutral-200" />
            }
            if (block.startsWith('- ')) {
              const items = block.split('\n').map((item) => item.replace(/^- /, ''))
              return (
                <ul key={index} className="my-4 space-y-2 list-disc list-inside text-neutral-700">
                  {items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              )
            }
            if (/^\d+\.\s/.test(block)) {
              const items = block.split('\n').map((item) => item.replace(/^\d+\.\s+/, ''))
              return (
                <ol key={index} className="my-4 space-y-2 list-decimal list-inside text-neutral-700">
                  {items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ol>
              )
            }
            return (
              <p key={index} className="my-4 leading-relaxed">
                {block}
              </p>
            )
          })}
        </div>

        {/* FAQs Section if configured */}
        {post.faqs && post.faqs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <h3 className="text-xl font-bold text-navy-900 mb-4">Frequently Asked Questions</h3>
            <Accordion
              items={post.faqs.map((faq, i) => ({
                id: `faq-${i}`,
                question: faq.question,
                answer: faq.answer,
              }))}
            />
          </div>
        )}

        {/* In-Article Conversion Callout Box */}
        <div className="mt-12 rounded-3xl bg-neutral-900 text-white p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue-lighter">
              Denver &amp; Surrounding Colorado Route Dispatch
            </span>
            <h3 className="text-2xl font-display font-bold text-white mt-1 mb-2">
              Need Professional Assistance With This Issue?
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 max-w-xl">
              PipeFlow Co. provides licensed technicians equipped with modern diagnostic tools to
              resolve your plumbing and HVAC problems quickly with transparent upfront quotes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/book-service" className="btn-primary !py-3 !px-6 text-xs">
                <CalendarDays className="h-4 w-4" />
                Book An On-Time Visit
              </Link>
              <Link href="/get-a-quote" className="btn-outline !text-white !border-white/30 text-xs !py-3 !px-5">
                <FileText className="h-4 w-4" />
                Request Upfront Quote
              </Link>
              <a
                href={`tel:${siteConfig.company.phone}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-white/90 hover:text-white px-3 py-3"
              >
                <Phone className="h-4 w-4 text-brand-red" />
                Call: {siteConfig.company.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="section-padding bg-neutral-50 border-t border-neutral-200/80">
          <div className="container-site">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-brand-blue inline-block" />
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <BlogCard key={rPost.id} post={rPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
