'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save,
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Globe,
  Tag,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react'
import type { BlogPost, BlogStatus, BlogFAQ } from '@/lib/blog/types'
import { MediaSelect } from '@/components/admin/MediaSelect'

interface BlogEditorProps {
  initialPost?: Partial<BlogPost>
  isNew?: boolean
}

export function BlogEditor({ initialPost, isNew = false }: BlogEditorProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [title, setTitle] = useState(initialPost?.title || '')
  const [slug, setSlug] = useState(initialPost?.slug || '')
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '')
  const [body, setBody] = useState(initialPost?.body || '')
  const [author, setAuthor] = useState(initialPost?.author || 'PipeFlow Master Trades Team')
  const [authorRole, setAuthorRole] = useState(initialPost?.authorRole || 'Plumbing & HVAC Specialist')
  const [categoryId, setCategoryId] = useState(initialPost?.categorySlug || 'plumbing')
  const [status, setStatus] = useState<BlogStatus>(initialPost?.status || 'draft')
  const [featuredImage, setFeaturedImage] = useState(
    initialPost?.featuredImage || '/assets/service-plumbing.jpg'
  )
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialPost?.featuredImageAlt || '')
  const [tagsString, setTagsString] = useState((initialPost?.tags || []).join(', '))

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialPost?.canonicalUrl || '')
  const [noindex, setNoindex] = useState(Boolean(initialPost?.noindex))
  const [ctaType, setCtaType] = useState<BlogPost['ctaType']>(initialPost?.ctaType || 'plumbing')

  // FAQs
  const [faqs, setFaqs] = useState<BlogFAQ[]>(initialPost?.faqs || [])

  // Auto-generate slug from title if new
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (isNew && !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generated)
    }
    if (!seoTitle) {
      setSeoTitle(val ? `${val} | PipeFlow Co.` : '')
    }
  }

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }])
  }

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs]
    updated[index][field] = value
    setFaqs(updated)
  }

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const handleSave = async (targetStatus?: BlogStatus) => {
    if (!title.trim()) {
      alert('Please enter an article title')
      return
    }

    const finalStatus = targetStatus || status
    const tags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const record = {
      title,
      slug:
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      excerpt,
      body,
      author,
      authorRole,
      categoryId,
      status: finalStatus,
      featuredImage,
      featuredImageAlt,
      tags,
      seoTitle: seoTitle || `${title} | PipeFlow Co.`,
      seoDescription: seoDescription || excerpt,
      canonicalUrl: canonicalUrl || `https://pipeflowco.com/blog/${slug}`,
      noindex,
      ctaType,
      faqs,
      published_at: finalStatus === 'published' ? (initialPost?.publishedAt || new Date().toISOString()) : (initialPost?.publishedAt || null),
    }

    setSaving(true)
    setSaveError(null)
    try {
      const response = await fetch(initialPost?.id ? `/api/admin/cms/blog?id=${encodeURIComponent(initialPost.id)}` : '/api/admin/cms/blog', {
        method: initialPost?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: record.title, slug: record.slug, excerpt: record.excerpt, body: record.body,
          featured_image: record.featuredImage, featured_image_alt: record.featuredImageAlt,
          author: record.author, status: record.status, published_at: record.published_at,
          seo_title: record.seoTitle, seo_description: record.seoDescription,
          category_name: categoryId === 'hvac' ? 'HVAC' : categoryId === 'emergency' ? 'Emergency' : 'Plumbing', category_slug: categoryId, noindex: record.noindex,
        }),
      })
      const result: { error?: string } = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save this article.')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save this article.')
      setSaving(false)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)

    if (isNew) {
      router.push('/admin/blogs')
    }
  }

  // SEO metrics
  const titleLength = (seoTitle || title).length
  const descLength = (seoDescription || excerpt).length
  const isTitleOptimal = titleLength >= 40 && titleLength <= 65
  const isDescOptimal = descLength >= 120 && descLength <= 165

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {/* Top Action Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-6 py-3.5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 transition-colors"
            title="Back to blogs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Blog CMS &bull;
              </span>
              <span
                className={`text-2xs font-bold uppercase px-2 py-0.5 rounded-full ${
                  status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : status === 'archived'
                    ? 'bg-neutral-200 text-neutral-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status}
              </span>
            </div>
            <h1 className="text-base font-bold text-navy-900 truncate max-w-md">
              {title || 'Untitled Article'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {slug && status === 'published' && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="btn-outline !py-2 !px-3.5 text-xs hidden sm:inline-flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Live
            </Link>
          )}

          <button
            type="button"
            onClick={() => void handleSave('draft')}
            disabled={saving}
            className="btn-outline !py-2 !px-4 text-xs"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => void handleSave('published')}
            disabled={saving}
            className="btn-primary !py-2 !px-5 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : status === 'published' ? 'Update & Keep Published' : 'Publish Article'}
          </button>
        </div>
      </header>

      {/* Success Alert */}
      {saved && (
        <div className="bg-green-600 text-white text-xs py-2 px-6 text-center font-semibold shadow-xs">
          ✓ Article saved successfully! Changes are immediately live in the blog engine.
        </div>
      )}
      {saveError && <p role="alert" className="mx-auto max-w-7xl px-6 pt-4 text-sm text-red-700">{saveError}</p>}

      {/* Editor 2-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Editor Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Slug Box */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
              <div>
                <label className="form-label font-bold text-navy-900">
                  Article Title <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. How to Prevent Frozen Pipes in Denver This Winter"
                  className="w-full text-xl sm:text-2xl font-bold font-display px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="form-label font-bold text-navy-900 flex items-center justify-between">
                  <span>URL Slug</span>
                  <span className="text-2xs text-neutral-400 font-normal">
                    Permanent URL identifier
                  </span>
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs">
                  <span className="text-neutral-400 select-none">https://pipeflowco.com/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-transparent font-mono text-navy-900 focus:outline-none ml-0.5"
                  />
                </div>
              </div>

              <div>
                <label className="form-label font-bold text-navy-900">
                  Short Excerpt / Summary <span className="text-brand-red">*</span>
                </label>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence lead paragraph shown on the blog index and search results..."
                  className="form-input resize-none text-sm"
                />
              </div>
            </div>

            {/* Content Body Editor */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <label className="form-label font-bold text-navy-900 mb-0">
                  Article Content (Markdown Supported)
                </label>
                <span className="text-2xs text-neutral-400">
                  Use ### for subheadings, - for bullets, 1. for lists
                </span>
              </div>

              <textarea
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your article in markdown format...&#10;&#10;### Introduction&#10;Explain the issue in plain English...&#10;&#10;---&#10;### Key Steps&#10;- Step one&#10;- Step two"
                className="w-full p-4 font-mono text-xs sm:text-sm text-neutral-800 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-y leading-relaxed"
              />
            </div>

            {/* In-Article FAQ Builder */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-navy-900">Article FAQs</h3>
                  <p className="text-2xs text-neutral-500">
                    Questions added here will generate interactive accordions and structured FAQPage schema.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add FAQ
                </button>
              </div>

              {faqs.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-3 text-center">
                  No FAQs added for this article yet. Click &ldquo;Add FAQ&rdquo; to insert common homeowner questions.
                </p>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="absolute top-3 right-3 text-neutral-400 hover:text-brand-red"
                        title="Remove question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div>
                        <label className="text-2xs font-bold text-navy-900 block mb-1">
                          Question #{idx + 1}
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                          placeholder="e.g. Can a heat pump work in sub-zero Denver weather?"
                          className="form-input !py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-2xs font-bold text-navy-900 block mb-1">
                          Answer
                        </label>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                          placeholder="Clear, authoritative answer..."
                          className="form-input !py-1.5 text-xs resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contextual Conversion CTA Selector */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <h3 className="text-sm font-bold text-navy-900 mb-1">In-Article Conversion CTA</h3>
              <p className="text-2xs text-neutral-500 mb-4">
                Controls which callout box is presented to the reader at the bottom of the article.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'plumbing', label: 'Plumbing Service' },
                  { id: 'hvac', label: 'HVAC Service' },
                  { id: 'emergency', label: 'Emergency 24/7' },
                  { id: 'quote', label: 'Quote Request' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCtaType(item.id as BlogPost['ctaType'])}
                    className={`rounded-xl border p-3 text-xs font-semibold transition-all ${
                      ctaType === item.id
                        ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publishing Settings */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-900 border-b border-neutral-100 pb-2">
                Publishing Status
              </h3>
              <div>
                <label className="form-label font-bold text-navy-900">Lifecycle Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BlogStatus)}
                  className="form-input text-xs"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public)</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived (Unpublished)</option>
                </select>
              </div>

              <div>
                <label className="form-label font-bold text-navy-900">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="form-input text-xs"
                >
                  {[{ id: 'plumbing', name: 'Plumbing' }, { id: 'hvac', name: 'HVAC' }, { id: 'emergency', name: 'Emergency' }].map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label font-bold text-navy-900">Author Name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label font-bold text-navy-900">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="e.g. Winterization, Pipes, Denver"
                  className="form-input text-xs"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-navy-900 border-b border-neutral-100 pb-2">
                Featured Photograph
              </h3>
              <div>
                <label className="form-label font-bold text-navy-900">Image Asset URL</label>
                <MediaSelect value={featuredImage} onChange={setFeaturedImage} title="Select featured blog image" />
              </div>

              <div>
                <label className="form-label font-bold text-navy-900">Image Alt Text (SEO)</label>
                <input
                  type="text"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder="Descriptive explanation for accessibility and Google Images"
                  className="form-input text-xs"
                />
              </div>
            </div>

            {/* Live Google Search Preview & SEO Health Checklist */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-brand-blue" />
                  Live Google Snippet
                </h3>
              </div>

              {/* Google Result Preview */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-left font-sans">
                <p className="text-2xs text-neutral-500 truncate">
                  https://pipeflowco.com &rsaquo; blog &rsaquo; {slug || 'article-slug'}
                </p>
                <p className="text-sm font-semibold text-blue-700 hover:underline line-clamp-1 mt-0.5">
                  {seoTitle || title || 'Article Title'}
                </p>
                <p className="text-xs text-neutral-600 line-clamp-2 mt-1 leading-snug">
                  {seoDescription || excerpt || 'Enter meta description to preview how your article will look on Google.'}
                </p>
              </div>

              {/* SEO Checklist */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Title Length:</span>
                  <span
                    className={`font-semibold ${
                      isTitleOptimal ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {titleLength} chars {isTitleOptimal ? '✓' : '(aim 50-60)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Meta Description:</span>
                  <span
                    className={`font-semibold ${
                      isDescOptimal ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {descLength} chars {isDescOptimal ? '✓' : '(aim 140-160)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">URL Slug:</span>
                  <span className="font-semibold text-green-600">{slug ? 'Configured ✓' : 'Missing'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Alt Text:</span>
                  <span
                    className={`font-semibold ${
                      featuredImageAlt ? 'text-green-600' : 'text-neutral-400'
                    }`}
                  >
                    {featuredImageAlt ? 'Present ✓' : 'Optional'}
                  </span>
                </div>
              </div>

              {/* Advanced SEO Toggles */}
              <div className="pt-3 border-t border-neutral-100 space-y-3">
                <div>
                  <label className="form-label font-bold text-navy-900 text-xs">Custom Meta Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Leave blank to use article title"
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="form-label font-bold text-navy-900 text-xs">Custom Meta Description</label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Leave blank to use excerpt"
                    className="form-input text-xs resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={noindex}
                    onChange={(e) => setNoindex(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-red focus:ring-brand-red"
                  />
                  <span className="text-xs text-neutral-700">
                    Hide from search engines (<code className="text-2xs">noindex</code>)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BlogEditor
