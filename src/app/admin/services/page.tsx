'use client'

import { useState } from 'react'
import {
  Flame,
  Droplets,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  Save,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

interface ServiceItem {
  id: string
  title: string
  slug: string
  category: 'plumbing' | 'hvac'
  shortDescription: string
  description?: string
  iconName?: string
  pricingNote?: string
  availability?: string
  featured: boolean
  emergency: boolean
  active: boolean
  seoTitle?: string
  seoDescription?: string
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(() =>
    siteConfig.defaultServices.map((s) => ({
      ...s,
      category: s.category as 'plumbing' | 'hvac',
      pricingNote: 'Custom estimate based on onsite diagnostic',
      availability: 'Same-day dispatch available across Denver Front Range',
      active: true,
    }))
  )

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'plumbing' | 'hvac'>('all')
  const [search, setSearch] = useState('')
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const filteredServices = services.filter((s) => {
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const toggleActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    )
    showToast('Service status updated')
  }

  const toggleFeatured = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, featured: !s.featured } : s))
    )
    showToast('Featured status updated')
  }

  const toggleEmergency = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, emergency: !s.emergency } : s))
    )
    showToast('Emergency status updated')
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return

    if (isNew) {
      setServices((prev) => [editingService, ...prev])
      showToast('New service added successfully')
    } else {
      setServices((prev) =>
        prev.map((s) => (s.id === editingService.id ? editingService : s))
      )
      showToast('Service updated successfully')
    }
    setEditingService(null)
    setIsNew(false)
  }

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
      setServices((prev) => prev.filter((s) => s.id !== id))
      showToast('Service removed')
    }
  }

  const handleAddNew = () => {
    setIsNew(true)
    setEditingService({
      id: `srv-${Date.now()}`,
      title: '',
      slug: '',
      category: 'plumbing',
      shortDescription: '',
      description: '',
      iconName: 'wrench',
      pricingNote: 'Free onsite evaluation with repair',
      availability: 'Same-day 24/7 emergency response',
      featured: false,
      emergency: false,
      active: true,
      seoTitle: '',
      seoDescription: '',
    })
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
            Service Catalog CMS
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Manage public plumbing & HVAC services, diagnostic pricing notes, emergency badges, and SEO metadata.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              categoryFilter === 'all'
                ? 'bg-navy-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Trades ({services.length})
          </button>
          <button
            onClick={() => setCategoryFilter('plumbing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              categoryFilter === 'plumbing'
                ? 'bg-brand-blue text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Droplets className="h-3.5 w-3.5" />
            Plumbing ({services.filter((s) => s.category === 'plumbing').length})
          </button>
          <button
            onClick={() => setCategoryFilter('hvac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              categoryFilter === 'hvac'
                ? 'bg-brand-red text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            HVAC ({services.filter((s) => s.category === 'hvac').length})
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
              service.active
                ? 'border-neutral-200 shadow-xs hover:border-brand-blue/40'
                : 'border-neutral-200/60 bg-neutral-50/70 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-2 rounded-xl ${
                      service.category === 'plumbing'
                        ? 'bg-blue-50 text-brand-blue'
                        : 'bg-red-50 text-brand-red'
                    }`}
                  >
                    {service.category === 'plumbing' ? (
                      <Droplets className="h-5 w-5" />
                    ) : (
                      <Flame className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <h3 className="font-bold text-navy-900 text-base">{service.title}</h3>
                    <span className="text-2xs font-mono text-neutral-500">
                      /services/{service.category}/{service.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsNew(false)
                      setEditingService(service)
                    }}
                    title="Edit Service"
                    className="p-1.5 text-neutral-500 hover:text-navy-900 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    title="Delete Service"
                    className="p-1.5 text-neutral-400 hover:text-brand-red rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
                {service.shortDescription}
              </p>

              {/* Tags & Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button
                  type="button"
                  onClick={() => toggleFeatured(service.id)}
                  className={`text-2xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                    service.featured
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  ★ {service.featured ? 'Featured' : 'Not Featured'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleEmergency(service.id)}
                  className={`text-2xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                    service.emergency
                      ? 'bg-red-100 text-red-800'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  }`}
                >
                  ⚡ {service.emergency ? 'Emergency 24/7' : 'Standard'}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(service.id)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    service.active ? 'bg-emerald-500' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${
                      service.active ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-neutral-600 font-medium">
                  {service.active ? 'Published' : 'Disabled'}
                </span>
              </div>

              <a
                href={`/services/${service.category}/${service.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand-blue hover:text-brand-blue-dark font-medium"
              >
                <span>Preview</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h2 className="text-xl font-bold font-heading text-navy-900">
                {isNew ? 'Create New Service' : `Edit: ${editingService.title}`}
              </h2>
              <button
                onClick={() => setEditingService(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.title}
                    onChange={(e) => {
                      const title = e.target.value
                      setEditingService((prev) =>
                        prev
                          ? {
                              ...prev,
                              title,
                              slug: isNew
                                ? title
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/(^-|-$)+/g, '')
                                : prev.slug,
                            }
                          : null
                      )
                    }}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="e.g. Boiler Repair & Maintenance"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.slug}
                    onChange={(e) => {
                      const slugVal = e.target.value
                      setEditingService((prev) =>
                        prev ? { ...prev, slug: slugVal } : null
                      )
                    }}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="boiler-repair"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Trade Category *
                  </label>
                  <select
                    value={editingService.category}
                    onChange={(e) => {
                      const catVal = e.target.value as 'plumbing' | 'hvac'
                      setEditingService((prev) =>
                        prev ? { ...prev, category: catVal } : null
                      )
                    }}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Icon Keyword
                  </label>
                  <input
                    type="text"
                    value={editingService.iconName || 'wrench'}
                    onChange={(e) => {
                      const iconVal = e.target.value
                      setEditingService((prev) =>
                        prev ? { ...prev, iconName: iconVal } : null
                      )
                    }}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="wrench, droplets, flame, shield, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Short Card Summary (Homepage & Grid) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingService.shortDescription}
                  onChange={(e) => {
                    const shortVal = e.target.value
                    setEditingService((prev) =>
                      prev ? { ...prev, shortDescription: shortVal } : null
                    )
                  }}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Concise 1-2 sentence overview for conversion cards."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Service Overview
                </label>
                <textarea
                  rows={3}
                  value={editingService.description || ''}
                  onChange={(e) => {
                    const descVal = e.target.value
                    setEditingService((prev) =>
                      prev ? { ...prev, description: descVal } : null
                    )
                  }}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Detailed explanation of technical approach, Denver climate suitability, and equipment."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Pricing Note
                  </label>
                  <input
                    type="text"
                    value={editingService.pricingNote || ''}
                    onChange={(e) => {
                      const priceVal = e.target.value
                      setEditingService((prev) =>
                        prev ? { ...prev, pricingNote: priceVal } : null
                      )
                    }}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="e.g. Free diagnostic with repair"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Availability Note
                  </label>
                  <input
                    type="text"
                    value={editingService.availability || ''}
                    onChange={(e) => {
                      const availVal = e.target.value
                      setEditingService((prev) =>
                        prev ? { ...prev, availability: availVal } : null
                      )
                    }}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="e.g. Same-day emergency response"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-neutral-50 p-4 rounded-2xl flex flex-wrap gap-6 items-center border border-neutral-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.featured}
                    onChange={(e) => {
                      const featVal = e.target.checked
                      setEditingService((prev) =>
                        prev ? { ...prev, featured: featVal } : null
                      )
                    }}
                    className="rounded text-brand-blue focus:ring-brand-blue h-4 w-4"
                  />
                  <span className="text-xs font-medium text-navy-900">Featured Service</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.emergency}
                    onChange={(e) => {
                      const emergVal = e.target.checked
                      setEditingService((prev) =>
                        prev ? { ...prev, emergency: emergVal } : null
                      )
                    }}
                    className="rounded text-brand-red focus:ring-brand-red h-4 w-4"
                  />
                  <span className="text-xs font-medium text-navy-900">24/7 Emergency Dispatch</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.active}
                    onChange={(e) => {
                      const actVal = e.target.checked
                      setEditingService((prev) =>
                        prev ? { ...prev, active: actVal } : null
                      )
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-medium text-navy-900">Published (Visible on Site)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
