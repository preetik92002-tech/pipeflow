'use client'

import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { MediaSelect } from '@/components/admin/MediaSelect'

interface ReviewRecord {
  id: string; reviewer_name: string; reviewer_city: string | null; rating: number; review_text: string
  service_name: string | null; date: string | null; verified: boolean; source: 'google' | 'yelp' | 'bbb' | 'internal' | null
  active: boolean; display_order: number; image_url: string | null
}
type ReviewForm = Omit<ReviewRecord, 'id'>
const empty: ReviewForm = { reviewer_name: '', reviewer_city: '', rating: 5, review_text: '', service_name: '', date: '', verified: false, source: 'internal', active: true, display_order: 0, image_url: '' }

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<ReviewRecord[]>([])
  const [editing, setEditing] = useState<(ReviewForm & { id?: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/cms/testimonial', { cache: 'no-store' })
      const result: { items?: ReviewRecord[]; error?: string } = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load testimonials.')
      setItems(result.items ?? []); setError(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load testimonials.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    setSaving(true); setError(null)
    try {
      const { id, ...payload } = editing
      const response = await fetch(`/api/admin/cms/testimonial${id ? `?id=${encodeURIComponent(id)}` : ''}`, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save testimonial.')
      setEditing(null); await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save testimonial.') }
    finally { setSaving(false) }
  }

  async function remove(item: ReviewRecord) {
    if (!window.confirm(`Delete the testimonial from ${item.reviewer_name}?`)) return
    const response = await fetch(`/api/admin/cms/testimonial?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to delete testimonial.'); return }
    await load()
  }

  return <div className="space-y-6"><header className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-navy-900">Testimonials</h1><p className="mt-1 text-xs text-neutral-500">Manage customer reviews and select them on the Homepage editor.</p></div><button type="button" onClick={() => setEditing({ ...empty })} className="btn-primary inline-flex items-center gap-2 !px-4 !py-2.5 text-xs"><Plus className="h-4 w-4" />Add testimonial</button></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p className="text-sm text-neutral-500">Loading testimonials…</p> : items.length === 0 ? <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">No testimonials yet.</div> : <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex justify-between gap-3"><div><h2 className="font-bold text-navy-900">{item.reviewer_name}</h2><p className="mt-1 text-xs text-neutral-500">{[item.reviewer_city, item.service_name].filter(Boolean).join(' · ') || 'No location/service set'}</p></div><span className={`text-[10px] font-bold uppercase ${item.active ? 'text-emerald-700' : 'text-neutral-400'}`}>{item.active ? 'Active' : 'Hidden'}</span></div><p className="mt-4 line-clamp-4 text-sm text-neutral-700">{item.review_text}</p><div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500"><span>{item.rating}/5 · Order {item.display_order}</span><div className="flex gap-2"><button type="button" aria-label="Edit testimonial" onClick={() => setEditing({ ...item })} className="text-brand-blue"><Pencil className="h-4 w-4" /></button><button type="button" aria-label="Delete testimonial" onClick={() => void remove(item)} className="text-brand-red"><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>}
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"><form onSubmit={(event) => void save(event)} className="my-4 max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{editing.id ? 'Edit' : 'Add'} testimonial</h2><button type="button" onClick={() => setEditing(null)} className="rounded-lg p-1 text-neutral-500">×</button></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Customer name<input required maxLength={120} value={editing.reviewer_name} onChange={(e) => setEditing({ ...editing, reviewer_name: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><label className="text-sm">Location<input maxLength={120} value={editing.reviewer_city || ''} onChange={(e) => setEditing({ ...editing, reviewer_city: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><label className="text-sm">Rating<select value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="text-sm">Service<input maxLength={120} value={editing.service_name || ''} onChange={(e) => setEditing({ ...editing, service_name: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><label className="text-sm">Date<input maxLength={40} value={editing.date || ''} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><label className="text-sm">Source<select value={editing.source || 'internal'} onChange={(e) => setEditing({ ...editing, source: e.target.value as ReviewForm['source'] })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2"><option value="internal">Internal</option><option value="google">Google</option><option value="yelp">Yelp</option><option value="bbb">BBB</option></select></label><label className="text-sm">Display order<input type="number" min={0} value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.verified} onChange={(e) => setEditing({ ...editing, verified: e.target.checked })} />Verified review</label></div><label className="block text-sm">Testimonial<textarea required maxLength={2000} rows={5} value={editing.review_text} onChange={(e) => setEditing({ ...editing, review_text: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><label className="block text-sm">Customer image<MediaSelect value={editing.image_url || ''} onChange={(url) => setEditing({ ...editing, image_url: url })} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />Show on website</label><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="btn-outline !px-4 !py-2">Cancel</button><button disabled={saving} className="btn-primary !px-4 !py-2">{saving ? 'Saving…' : 'Save testimonial'}</button></div></form></div>}
  </div>
}
