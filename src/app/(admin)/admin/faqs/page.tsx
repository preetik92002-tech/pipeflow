'use client'

import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

interface FaqRecord { id: string; question: string; answer: string; category: string | null; sort_order: number; active: boolean }
type FaqForm = Omit<FaqRecord, 'id'>
const empty: FaqForm = { question: '', answer: '', category: 'home', sort_order: 0, active: true }

export default function AdminFaqsPage() {
  const [items, setItems] = useState<FaqRecord[]>([])
  const [editing, setEditing] = useState<(FaqForm & { id?: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true)
    try { const response = await fetch('/api/admin/cms/faq', { cache: 'no-store' }); const result: { items?: FaqRecord[]; error?: string } = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to load FAQs.'); setItems(result.items ?? []); setError(null) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load FAQs.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  async function save(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!editing) return; setSaving(true); setError(null); try { const { id, ...payload } = editing; const response = await fetch(`/api/admin/cms/faq${id ? `?id=${encodeURIComponent(id)}` : ''}`, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to save FAQ.'); setEditing(null); await load() } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save FAQ.') } finally { setSaving(false) } }
  async function remove(item: FaqRecord) { if (!window.confirm('Delete this FAQ?')) return; const response = await fetch(`/api/admin/cms/faq?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' }); const result = await response.json(); if (!response.ok) { setError(result.error || 'Unable to delete FAQ.'); return } await load() }
  return <div className="space-y-6"><header className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-navy-900">FAQs</h1><p className="mt-1 text-xs text-neutral-500">Edit questions and answers, then select the homepage questions in Homepage Content.</p></div><button type="button" onClick={() => setEditing({ ...empty })} className="btn-primary inline-flex items-center gap-2 !px-4 !py-2.5 text-xs"><Plus className="h-4 w-4" />Add FAQ</button></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p className="text-sm text-neutral-500">Loading FAQs…</p> : items.length === 0 ? <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">No FAQs yet.</div> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-bold text-navy-900">{item.question}</h2><p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">{item.answer}</p><p className="mt-3 text-xs text-neutral-400">{item.category || 'General'} · Order {item.sort_order} · {item.active ? 'Active' : 'Hidden'}</p></div><div className="flex gap-3"><button type="button" aria-label="Edit FAQ" onClick={() => setEditing({ ...item })} className="text-brand-blue"><Pencil className="h-4 w-4" /></button><button type="button" aria-label="Delete FAQ" onClick={() => void remove(item)} className="text-brand-red"><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>}
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={(event) => void save(event)} className="w-full max-w-xl space-y-4 rounded-2xl bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{editing.id ? 'Edit' : 'Add'} FAQ</h2><button type="button" onClick={() => setEditing(null)} aria-label="Close" className="text-xl text-neutral-500">×</button></div><label className="block text-sm">Question<input required maxLength={300} value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><label className="block text-sm">Answer<textarea required maxLength={3000} rows={5} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm">Category<input maxLength={80} value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label><label className="block text-sm">Order<input type="number" min={0} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-neutral-300 p-2" /></label></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />Visible</label><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="btn-outline !px-4 !py-2">Cancel</button><button disabled={saving} className="btn-primary !px-4 !py-2">{saving ? 'Saving…' : 'Save FAQ'}</button></div></form></div>}
  </div>
}
