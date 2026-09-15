'use client'

import { useState } from 'react'
import {
  Globe,
  Search,
  CheckCircle2,
  Save,
  Share2,
  FileCode,
  Sparkles,
  ExternalLink,
  Tag,
  Plus,
  X,
} from 'lucide-react'

export default function AdminSEOPage() {
  const [siteTitle, setSiteTitle] = useState('PipeFlow Co. | Denver Plumbing & HVAC Services')
  const [titleTemplate, setTitleTemplate] = useState('%s | PipeFlow Co.')
  const [metaDescription, setMetaDescription] = useState(
    'Denver’s trusted plumbing and HVAC experts. Emergency leak repairs, boiler installation, furnace maintenance, and AC service across Denver and Front Range communities.'
  )
  const [canonicalDomain, setCanonicalDomain] = useState('https://pipeflowco.com')
  const [ogImage, setOgImage] = useState('/assets/hero-hvac-tech.jpg')
  const [keywords, setKeywords] = useState<string[]>([
    'Denver plumber',
    'Denver HVAC repair',
    'emergency plumbing Denver',
    'furnace repair Lakewood CO',
    'water heater installation Aurora',
    'Colorado boiler service',
    '24/7 HVAC technician Denver',
  ])
  const [newKeyword, setNewKeyword] = useState('')
  const [customRobots, setCustomRobots] = useState(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://pipeflowco.com/sitemap.xml`
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleAddKeyword = () => {
    const clean = newKeyword.trim()
    if (clean && !keywords.includes(clean)) {
      setKeywords([...keywords, clean])
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    showToast('SEO & Metadata settings saved to database')
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-brand-blue animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-brand-blue-lighter" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-navy-900">
            SEO & Metadata Engine
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Configure global search engine rankings, OpenGraph social cards, JSON-LD Schema defaults, and robots rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-xs self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Config */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-blue" />
              Global Meta Tags
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Default Site Title
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <span className="text-2xs text-neutral-500 mt-1 block">
                {siteTitle.length} / 60 recommended characters
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Title Template (App Router Format)
              </label>
              <input
                type="text"
                value={titleTemplate}
                onChange={(e) => setTitleTemplate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Global Meta Description
              </label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue leading-relaxed"
              />
              <span className="text-2xs text-neutral-500 mt-1 block">
                {metaDescription.length} / 160 recommended characters
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Canonical Base URL
              </label>
              <input
                type="url"
                value={canonicalDomain}
                onChange={(e) => setCanonicalDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          {/* Targeted Keywords Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-brand-blue" />
              Target Colorado Search Keywords
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add keyword (e.g. emergency boiler repair Denver)..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddKeyword()
                  }
                }}
                className="flex-1 px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-navy-900 rounded-xl text-xs font-medium border border-neutral-200"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-neutral-400 hover:text-brand-red transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Robots.txt Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <FileCode className="h-5 w-5 text-brand-blue" />
              Robots.txt & Sitemap Directive
            </h2>
            <p className="text-xs text-neutral-500">
              Generated dynamically via <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">src/app/robots.ts</code> and <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">src/app/sitemap.ts</code>.
            </p>
            <textarea
              rows={5}
              value={customRobots}
              onChange={(e) => setCustomRobots(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs font-mono bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </form>

        {/* Right 1 Col: Live Google & Social Previews */}
        <div className="space-y-6">
          {/* Google SERP Preview */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-brand-blue" />
                Google SERP Snippet Preview
              </h3>
              <span className="text-2xs font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs font-sans text-left space-y-1">
              <div className="text-2xs text-neutral-600 flex items-center gap-1">
                <span>pipeflowco.com</span>
                <span>›</span>
              </div>
              <div className="text-blue-700 hover:underline text-base font-medium leading-snug cursor-pointer line-clamp-1">
                {siteTitle}
              </div>
              <div className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                {metaDescription}
              </div>
            </div>
          </div>

          {/* Social OpenGraph Preview */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-brand-blue" />
                Social Share Preview (OpenGraph)
              </h3>
            </div>

            <div className="rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
              <div className="relative aspect-video bg-neutral-900">
                <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center p-4 text-center">
                  <div>
                    <span className="text-brand-blue-lighter text-2xs font-bold uppercase tracking-wider block mb-1">
                      PipeFlow Co. • Denver CO
                    </span>
                    <span className="text-white font-bold text-sm leading-tight block">
                      {siteTitle}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-neutral-50 text-xs">
                <span className="text-2xs uppercase text-neutral-400 font-semibold block">
                  PIPEFLOWCO.COM
                </span>
                <p className="font-semibold text-navy-900 truncate mt-0.5">{siteTitle}</p>
                <p className="text-neutral-500 text-2xs line-clamp-1 mt-0.5">{metaDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
