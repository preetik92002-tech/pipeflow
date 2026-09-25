'use client'

import { useCallback, useEffect, useState } from 'react'
import { Edit, Plus, Save, Trash2, X } from 'lucide-react'
import { MediaSelect } from '@/components/admin/MediaSelect'

type Collection = 'service' | 'service_area'
type CmsRecord = Record<string, string | number | boolean | null>

const fields: Record<Collection, { name: string; label: string; kind?: 'textarea' | 'number' | 'select' | 'checkbox' }[]> = {
  service: [
    { name: 'title', label: 'Service name' }, { name: 'slug', label: 'URL slug' },
    { name: 'category', label: 'Category', kind: 'select' }, { name: 'short_description', label: 'Short description', kind: 'textarea' },
    { name: 'description', label: 'Full description', kind: 'textarea' }, { name: 'image_url', label: 'Image URL' },
    { name: 'display_order', label: 'Display order', kind: 'number' }, { name: 'seo_title', label: 'SEO title' },
    { name: 'seo_description', label: 'SEO description', kind: 'textarea' }, { name: 'featured', label: 'Featured service', kind: 'checkbox' },
    { name: 'active', label: 'Visible on website', kind: 'checkbox' },
  ],
  service_area: [
    { name: 'name', label: 'Area name' }, { name: 'slug', label: 'URL slug' }, { name: 'state', label: 'State' },
    { name: 'description', label: 'Description', kind: 'textarea' }, { name: 'hero_image', label: 'Hero image URL' },
    { name: 'zip_codes', label: 'Covered ZIP codes (comma separated)' },
    { name: 'sort_order', label: 'Display order', kind: 'number' }, { name: 'seo_title', label: 'SEO title' },
    { name: 'seo_description', label: 'SEO description', kind: 'textarea' }, { name: 'active', label: 'Visible on website', kind: 'checkbox' },
  ],
}

const blank: Record<Collection, CmsRecord> = {
  service: { title: '', slug: '', category: 'plumbing', category_id: null, short_description: '', description: '', image_url: '', active: true, featured: false, display_order: 0, seo_title: '', seo_description: '' },
  service_area: { name: '', slug: '', state: 'CO', description: '', hero_image: '', zip_codes: '', active: true, sort_order: 0, seo_title: '', seo_description: '' },
}

export function SimpleCmsManager({ collection }: { collection: Collection }) {
  const [records, setRecords] = useState<(CmsRecord & { id: string })[]>([])
  const [editing, setEditing] = useState<(CmsRecord & { id?: string }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/cms/${collection}`, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load records.')
      setRecords(result.items as (CmsRecord & { id: string })[])
      setError(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load records.') }
    finally { setLoading(false) }
  }, [collection])

  useEffect(() => { void load() }, [load])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    const payload: Record<string, unknown> = { ...editing }
    delete payload.id
    if (collection === 'service_area') payload.zip_codes = String(payload.zip_codes || '').split(',').map((zip) => zip.trim()).filter(Boolean)
    const response = await fetch(editing.id ? `/api/admin/cms/${collection}?id=${encodeURIComponent(editing.id)}` : `/api/admin/cms/${collection}`, {
      method: editing.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to save this record.'); return }
    setEditing(null)
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this record?')) return
    const response = await fetch(`/api/admin/cms/${collection}?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to remove this record.'); return }
    await load()
  }

  const titleField = collection === 'service' ? 'title' : 'name'
  const orderField = collection === 'service' ? 'display_order' : 'sort_order'

  return <div className="space-y-6">
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-navy-900">{collection === 'service' ? 'Services CMS' : 'Service Areas CMS'}</h1><p className="mt-1 text-xs text-neutral-500">Changes are saved in Supabase and revalidated on the public website.</p></div><button onClick={() => setEditing({ ...blank[collection] })} className="btn-primary !py-2.5 !px-5 text-xs inline-flex items-center gap-2"><Plus className="h-4 w-4" />Add {collection === 'service' ? 'service' : 'area'}</button></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{loading ? <p className="text-sm text-neutral-500">Loading records…</p> : records.map((record) => <article key={record.id} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs"><div className="flex justify-between gap-3"><div><h2 className="font-bold text-navy-900">{String(record[titleField] || '')}</h2><p className="mt-1 font-mono text-xs text-neutral-400">/{collection === 'service' ? `services/${record.category}/${record.slug}` : `service-areas/${record.slug}`}</p></div><span className={`text-[10px] font-bold uppercase ${record.active ? 'text-emerald-700' : 'text-neutral-400'}`}>{record.active ? 'Active' : 'Hidden'}</span></div><p className="text-sm text-neutral-600 mt-3 line-clamp-3">{String(record.short_description || record.description || '')}</p><div className="flex items-center justify-between border-t border-neutral-100 mt-4 pt-3 text-xs text-neutral-500"><span>Order {String(record[orderField])}</span><div className="flex gap-1"><button aria-label="Edit" onClick={() => setEditing({ ...record })} className="p-2 text-brand-blue"><Edit className="h-4 w-4" /></button><button aria-label="Delete" onClick={() => void remove(record.id)} className="p-2 text-brand-red"><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>
    {editing && <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center overflow-y-auto"><form onSubmit={(event) => void save(event)} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{editing.id ? 'Edit' : 'Create'} {collection === 'service' ? 'service' : 'service area'}</h2><button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5" /></button></div>{fields[collection].map((field) => <label key={field.name} className={`block text-sm text-neutral-700 ${field.kind === 'checkbox' ? 'flex items-center gap-2' : ''}`}>{field.kind === 'checkbox' ? <><input type="checkbox" checked={Boolean(editing[field.name])} onChange={(e) => setEditing({ ...editing, [field.name]: e.target.checked })} />{field.label}</> : <>{field.label}{field.kind === 'select' ? <select value={String(editing[field.name] || 'plumbing')} onChange={(e) => setEditing({ ...editing, [field.name]: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2"><option value="plumbing">Plumbing</option><option value="hvac">HVAC</option><option value="emergency">Emergency</option></select> : field.name === 'image_url' || field.name === 'hero_image' ? <MediaSelect value={String(editing[field.name] || '')} onChange={(url) => setEditing({ ...editing, [field.name]: url })} /> : field.kind === 'textarea' ? <textarea rows={3} value={String(editing[field.name] || '')} onChange={(e) => setEditing({ ...editing, [field.name]: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /> : <input type={field.kind === 'number' ? 'number' : 'text'} required={['title','name','slug','category','short_description','state'].includes(field.name)} value={String(editing[field.name] ?? '')} onChange={(e) => setEditing({ ...editing, [field.name]: field.kind === 'number' ? Number(e.target.value) : e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" />}</>}</label>)}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="btn-outline !py-2 !px-4">Cancel</button><button type="submit" className="btn-primary !py-2 !px-4 inline-flex items-center gap-2"><Save className="h-4 w-4" />Save</button></div></form></div>}
  </div>
}
