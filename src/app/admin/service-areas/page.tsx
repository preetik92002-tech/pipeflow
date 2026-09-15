'use client'

import { useState } from 'react'
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  Save,
  AlertCircle,
  Building,
} from 'lucide-react'
import { siteConfig } from '@/lib/config/site'

interface ServiceAreaItem {
  id: string
  name: string
  slug: string
  state: string
  zipCodes: string[]
  active: boolean
  primary: boolean
  description?: string
}

export default function AdminServiceAreasPage() {
  const [areas, setAreas] = useState<ServiceAreaItem[]>(() =>
    siteConfig.defaultServiceAreas.map((a) => ({
      ...a,
      zipCodes: a.zipCodes || [],
      description: `Full plumbing, heating, boiler, and air conditioning support across all ${a.name} neighborhoods.`,
    }))
  )

  const [search, setSearch] = useState('')
  const [editingArea, setEditingArea] = useState<ServiceAreaItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [newZipInput, setNewZipInput] = useState('')
  const [testZip, setTestZip] = useState('')
  const [testResult, setTestResult] = useState<{ covered: boolean; area?: string } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const filteredAreas = areas.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.zipCodes.some((z) => z.includes(search))
  )

  const toggleActive = (id: string) => {
    setAreas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    )
    showToast('Territory active status updated')
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove coverage area "${name}"?`)) {
      setAreas((prev) => prev.filter((a) => a.id !== id))
      showToast('Territory removed')
    }
  }

  const handleAddNew = () => {
    setIsNew(true)
    setEditingArea({
      id: `area-${Date.now()}`,
      name: '',
      slug: '',
      state: 'CO',
      zipCodes: [],
      active: true,
      primary: false,
      description: '',
    })
    setNewZipInput('')
  }

  const handleAddZip = () => {
    const cleanZip = newZipInput.trim()
    if (cleanZip && editingArea && !editingArea.zipCodes.includes(cleanZip)) {
      setEditingArea({
        ...editingArea,
        zipCodes: [...editingArea.zipCodes, cleanZip],
      })
      setNewZipInput('')
    }
  }

  const handleRemoveZip = (zip: string) => {
    if (editingArea) {
      setEditingArea({
        ...editingArea,
        zipCodes: editingArea.zipCodes.filter((z) => z !== zip),
      })
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArea) return

    if (isNew) {
      setAreas((prev) => [editingArea, ...prev])
      showToast('New service territory added')
    } else {
      setAreas((prev) =>
        prev.map((a) => (a.id === editingArea.id ? editingArea : a))
      )
      showToast('Territory updated')
    }
    setEditingArea(null)
    setIsNew(false)
  }

  const handleCheckCoverage = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = testZip.trim()
    if (!clean) return

    const matched = areas.find((a) => a.active && a.zipCodes.includes(clean))
    if (matched) {
      setTestResult({ covered: true, area: matched.name })
    } else {
      setTestResult({ covered: false })
    }
  }

  const totalZipsCovered = Array.from(
    new Set(areas.flatMap((a) => (a.active ? a.zipCodes : [])))
  ).length

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast */}
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
            Service Territory & ZIP Coverage
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Configure Denver Front Range municipality pages, active postal codes, and local search landing pages.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Territory
        </button>
      </div>

      {/* Overview Stats & Quick Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-brand-blue rounded-xl">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-navy-900">{areas.length} Municipalities</div>
            <div className="text-xs text-neutral-500">
              {areas.filter((a) => a.active).length} Active Territories
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-navy-900">{totalZipsCovered} Total ZIPs</div>
            <div className="text-xs text-neutral-500">Validated Front Range Postal Codes</div>
          </div>
        </div>

        {/* Live ZIP Tester */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white p-6 rounded-2xl shadow-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-blue-lighter mb-2">
            Interactive ZIP Lookup Tester
          </h3>
          <form onSubmit={handleCheckCoverage} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 80202"
              maxLength={5}
              value={testZip}
              onChange={(e) => {
                setTestZip(e.target.value)
                setTestResult(null)
              }}
              className="w-28 px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-sm text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Test
            </button>
          </form>
          {testResult && (
            <div className="mt-3 text-xs flex items-center gap-1.5">
              {testResult.covered ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">
                    Covered under {testResult.area}!
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-brand-red-light" />
                  <span className="text-neutral-300">Out of immediate service zone.</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by city name or ZIP code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
      </div>

      {/* Area Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAreas.map((area) => (
          <div
            key={area.id}
            className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all ${
              area.active
                ? 'border-neutral-200 shadow-xs hover:border-brand-blue/40'
                : 'border-neutral-200/60 bg-neutral-50/70 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-brand-blue">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 text-lg flex items-center gap-2">
                      {area.name}, {area.state}
                      {area.primary && (
                        <span className="text-2xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                          Hub
                        </span>
                      )}
                    </h3>
                    <span className="text-2xs font-mono text-neutral-500">
                      /service-areas/{area.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsNew(false)
                      setEditingArea(area)
                    }}
                    title="Edit Area"
                    className="p-1.5 text-neutral-500 hover:text-navy-900 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(area.id, area.name)}
                    title="Delete Area"
                    className="p-1.5 text-neutral-400 hover:text-brand-red rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 line-clamp-2 mt-2 mb-4 leading-relaxed">
                {area.description}
              </p>

              {/* ZIP codes pills */}
              <div className="mb-4">
                <div className="text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Covered Postal Codes ({area.zipCodes.length})
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {area.zipCodes.map((zip) => (
                    <span
                      key={zip}
                      className="text-2xs font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200"
                    >
                      {zip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(area.id)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    area.active ? 'bg-emerald-500' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${
                      area.active ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-neutral-600 font-medium">
                  {area.active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <a
                href={`/service-areas/${area.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand-blue hover:text-brand-blue-dark font-medium"
              >
                <span>View Page</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingArea && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h2 className="text-xl font-bold font-heading text-navy-900">
                {isNew ? 'Add Territory' : `Edit Territory: ${editingArea.name}`}
              </h2>
              <button
                onClick={() => setEditingArea(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    City / Municipality *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArea.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setEditingArea((prev) =>
                        prev
                          ? {
                              ...prev,
                              name,
                              slug: isNew
                                ? name
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/(^-|-$)+/g, '')
                                : prev.slug,
                            }
                          : null
                      )
                    }}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="e.g. Lakewood"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArea.slug}
                    onChange={(e) => {
                      const slugVal = e.target.value
                      setEditingArea((prev) =>
                        prev ? { ...prev, slug: slugVal } : null
                      )
                    }}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="lakewood"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Local Overview Description
                </label>
                <textarea
                  rows={3}
                  value={editingArea.description || ''}
                  onChange={(e) => {
                    const descVal = e.target.value
                    setEditingArea((prev) =>
                      prev ? { ...prev, description: descVal } : null
                    )
                  }}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Local heating & plumbing service narrative for this Colorado municipality."
                />
              </div>

              {/* ZIP codes Manager */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Covered ZIP Codes ({editingArea.zipCodes.length})
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add ZIP (e.g. 80214)"
                    value={newZipInput}
                    onChange={(e) => setNewZipInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddZip()
                      }
                    }}
                    className="flex-1 px-3.5 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <button
                    type="button"
                    onClick={handleAddZip}
                    className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Add ZIP
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  {editingArea.zipCodes.length === 0 ? (
                    <span className="text-xs text-neutral-400">No ZIP codes added yet.</span>
                  ) : (
                    editingArea.zipCodes.map((zip) => (
                      <span
                        key={zip}
                        className="inline-flex items-center gap-1.5 text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs"
                      >
                        {zip}
                        <button
                          type="button"
                          onClick={() => handleRemoveZip(zip)}
                          className="text-neutral-400 hover:text-brand-red"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Flags */}
              <div className="bg-neutral-50 p-4 rounded-2xl flex flex-wrap gap-6 items-center border border-neutral-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingArea.primary}
                    onChange={(e) => {
                      const primVal = e.target.checked
                      setEditingArea((prev) =>
                        prev ? { ...prev, primary: primVal } : null
                      )
                    }}
                    className="rounded text-brand-blue focus:ring-brand-blue h-4 w-4"
                  />
                  <span className="text-xs font-medium text-navy-900">Primary Hub (Denver)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingArea.active}
                    onChange={(e) => {
                      const actVal = e.target.checked
                      setEditingArea((prev) =>
                        prev ? { ...prev, active: actVal } : null
                      )
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-medium text-navy-900">Active Service Area</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingArea(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  Save Territory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
