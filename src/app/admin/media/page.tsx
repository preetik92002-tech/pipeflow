'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Copy, Trash2, Upload } from 'lucide-react'

interface MediaItem { id: string; filename: string; url: string; alt_text: string | null; size_bytes: number | null; created_at: string }

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/media', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load media.')
      setItems(result.items as MediaItem[]); setError(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load media.') }
  }, [])
  useEffect(() => { void load() }, [load])

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) { setError('Choose an image to upload.'); return }
    const form = new FormData(); form.set('file', file); form.set('alt_text', altText)
    setBusy(true); setError(null); setNotice(null)
    try {
      const response = await fetch('/api/admin/media', { method: 'POST', body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed.')
      setFile(null); setAltText(''); setNotice('Image uploaded to Supabase Storage.'); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.') }
    finally { setBusy(false) }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Delete ${item.filename}? This removes the stored object.`)) return
    const response = await fetch(`/api/admin/media?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to delete image.'); return }
    setNotice('Image deleted.'); await load()
  }

  return <div className="space-y-6"><header><h1 className="text-2xl font-bold text-navy-900">Media Library</h1><p className="mt-1 text-xs text-neutral-500">Upload public website images to the Supabase site-media bucket.</p></header>
    <form onSubmit={(event) => void upload(event)} className="grid grid-cols-1 gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-sm font-medium">Image file<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-xs" /></label><label className="text-sm font-medium">Alt text<input value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={250} className="mt-1 block w-full rounded-lg border border-neutral-300 p-2 text-sm" /></label><button disabled={busy} className="btn-primary !py-2.5 !px-4 inline-flex items-center gap-2"><Upload className="h-4 w-4" />{busy ? 'Uploading…' : 'Upload image'}</button></form>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"><div className="relative aspect-video bg-neutral-100"><Image src={item.url} alt={item.alt_text || item.filename} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div><div className="space-y-2 p-4"><p className="truncate text-sm font-semibold text-navy-900">{item.filename}</p><p className="text-xs text-neutral-500">{item.alt_text || 'No alt text'}{item.size_bytes ? ` · ${(item.size_bytes / 1024).toFixed(0)} KB` : ''}</p><div className="flex justify-between border-t border-neutral-100 pt-2"><button onClick={() => void navigator.clipboard.writeText(item.url)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue"><Copy className="h-3.5 w-3.5" />Copy URL</button><button onClick={() => void remove(item)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red"><Trash2 className="h-3.5 w-3.5" />Delete</button></div></div></article>)}</div>
  </div>
}
