'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Image as ImageIcon,
  Upload,
  Search,
  CheckCircle2,
  Copy,
  Trash2,
  ExternalLink,
  Filter,
  FileText,
  Folder,
} from 'lucide-react'

interface MediaItem {
  id: string
  filename: string
  url: string
  bucket: 'site-media' | 'blog-media' | 'service-media' | 'pro-documents'
  altText?: string
  width?: number
  height?: number
  sizeKb: number
  uploadedAt: string
}

const initialMedia: MediaItem[] = [
  {
    id: 'med-1',
    filename: 'hero-hvac-tech.jpg',
    url: '/assets/hero-hvac-tech.jpg',
    bucket: 'site-media',
    altText: 'Certified PipeFlow HVAC technician performing system diagnostic in Denver',
    width: 1920,
    height: 1080,
    sizeKb: 342,
    uploadedAt: '2025-01-10',
  },
  {
    id: 'med-2',
    filename: 'service-plumbing.jpg',
    url: '/assets/service-plumbing.jpg',
    bucket: 'service-media',
    altText: 'Master plumber installing heavy-duty copper piping in residential basement',
    width: 1600,
    height: 1066,
    sizeKb: 285,
    uploadedAt: '2025-01-12',
  },
  {
    id: 'med-3',
    filename: 'service-detail-1.jpg',
    url: '/assets/service-detail-1.jpg',
    bucket: 'service-media',
    altText: 'Technician inspecting precision manifold gauge on high-efficiency heat pump',
    width: 1600,
    height: 1066,
    sizeKb: 290,
    uploadedAt: '2025-01-15',
  },
  {
    id: 'med-4',
    filename: 'service-detail-2.jpg',
    url: '/assets/service-detail-2.jpg',
    bucket: 'service-media',
    altText: 'Drain camera diagnostic monitor showing clean sewer line hydro-jetting',
    width: 1600,
    height: 1066,
    sizeKb: 310,
    uploadedAt: '2025-01-18',
  },
  {
    id: 'med-5',
    filename: 'logo.png',
    url: '/assets/logo.png',
    bucket: 'site-media',
    altText: 'PipeFlow Co. Primary Brand Identity Logo',
    width: 600,
    height: 180,
    sizeKb: 45,
    uploadedAt: '2025-01-01',
  },
]

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia)
  const [search, setSearch] = useState('')
  const [bucketFilter, setBucketFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    showToast(`Copied URL: ${url}`)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from storage?`)) {
      setMediaList((prev) => prev.filter((m) => m.id !== id))
      if (selectedItem?.id === id) setSelectedItem(null)
      showToast('Media deleted successfully')
    }
  }

  const filteredMedia = mediaList.filter((m) => {
    const matchesBucket = bucketFilter === 'all' || m.bucket === bucketFilter
    const matchesSearch =
      m.filename.toLowerCase().includes(search.toLowerCase()) ||
      (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()))
    return matchesBucket && matchesSearch
  })

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
            Media & Asset Library
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Browse and manage images stored across Supabase Storage buckets (<code className="text-2xs font-mono bg-neutral-100 px-1 py-0.5 rounded">site-media</code>, <code className="text-2xs font-mono bg-neutral-100 px-1 py-0.5 rounded">blog-media</code>, <code className="text-2xs font-mono bg-neutral-100 px-1 py-0.5 rounded">service-media</code>).
          </p>
        </div>

        <label className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-xs cursor-pointer self-start sm:self-auto">
          <Upload className="h-4 w-4" />
          <span>Upload New Asset</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const newItem: MediaItem = {
                  id: `med-${Date.now()}`,
                  filename: file.name,
                  url: URL.createObjectURL(file),
                  bucket: 'site-media',
                  altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                  sizeKb: Math.round(file.size / 1024),
                  uploadedAt: new Date().toISOString().split('T')[0],
                }
                setMediaList((prev) => [newItem, ...prev])
                showToast(`Uploaded ${file.name}`)
              }
            }}
          />
        </label>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search assets by name or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['all', 'site-media', 'service-media', 'blog-media', 'pro-documents'].map((bucket) => (
            <button
              key={bucket}
              onClick={() => setBucketFilter(bucket)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                bucketFilter === bucket
                  ? 'bg-navy-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {bucket.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`group relative bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                selectedItem?.id === item.id
                  ? 'border-brand-blue ring-2 ring-brand-blue/30'
                  : 'border-neutral-200'
              }`}
            >
              <div className="relative aspect-video bg-neutral-100 flex items-center justify-center">
                {item.url.endsWith('.png') || item.url.endsWith('.jpg') || item.url.startsWith('blob:') ? (
                  <Image
                    src={item.url}
                    alt={item.altText || item.filename}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <FileText className="h-10 w-10 text-neutral-400" />
                )}
                <div className="absolute top-2 left-2 bg-navy-900/80 backdrop-blur-xs text-white text-2xs px-2 py-0.5 rounded-md font-mono">
                  {item.bucket}
                </div>
              </div>

              <div className="p-3">
                <p className="text-xs font-semibold text-navy-900 truncate">{item.filename}</p>
                <div className="flex items-center justify-between text-2xs text-neutral-500 mt-1">
                  <span>{item.sizeKb} KB</span>
                  <span>{item.uploadedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Media Inspector Drawer */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs h-fit sticky top-6">
          {selectedItem ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-navy-900 mb-1">Asset Details</h3>
                <p className="text-xs text-neutral-500">Inspection & Copy URL</p>
              </div>

              <div className="relative aspect-video bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 flex items-center justify-center">
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.altText || selectedItem.filename}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-neutral-500 block uppercase tracking-wider text-2xs">
                    Filename
                  </span>
                  <span className="font-mono text-navy-900 text-sm font-medium">
                    {selectedItem.filename}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-neutral-500 block uppercase tracking-wider text-2xs">
                    Storage Bucket
                  </span>
                  <span className="inline-block bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-mono text-2xs">
                    {selectedItem.bucket}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-neutral-500 block uppercase tracking-wider text-2xs">
                    Direct Public URL
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="flex-1 bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-mono truncate select-all"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedItem.url)}
                      title="Copy URL"
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {selectedItem.altText && (
                  <div>
                    <span className="font-semibold text-neutral-500 block uppercase tracking-wider text-2xs">
                      SEO Alt Description
                    </span>
                    <p className="text-neutral-700 mt-1 italic leading-relaxed">
                      &quot;{selectedItem.altText}&quot;
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(selectedItem.id, selectedItem.filename)}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-red hover:text-red-700 font-semibold"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Asset</span>
                </button>

                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-blue hover:text-brand-blue-dark font-semibold"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 space-y-3">
              <Folder className="h-10 w-10 mx-auto text-neutral-300" />
              <p className="text-xs">Select an asset from the grid to inspect details and copy its URL.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
