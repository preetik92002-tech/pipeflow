'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'

const BUILT_IN = [
  ['/art/hero-plumbing.svg', 'Plumbing'], ['/art/hero-hvac.svg', 'HVAC'], ['/art/home-pro.svg', 'Home'], ['/art/water-heater.svg', 'Water heater'],
  ['/art/frozen-pipe.svg', 'Frozen pipe'], ['/art/ac-repair.svg', 'AC repair'], ['/art/ac-installation.svg', 'AC installation'], ['/art/denver.svg', 'Denver'], ['/art/boulder.svg', 'Boulder'],
] as const

interface MediaItem { id: string; filename: string; url: string; alt_text: string | null }

export function MediaSelect({ value, onChange, title = 'Choose media' }: { value: string; onChange: (url: string) => void; title?: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function browse() {
    setOpen(true); setLoading(true); setError(null)
    try {
      const response = await fetch('/api/admin/media', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load media.')
      setItems(result.items as MediaItem[])
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load media.') }
    finally { setLoading(false) }
  }

  return <>
    <div className="flex gap-2"><input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm" placeholder="Image URL" /><button type="button" onClick={() => void browse()} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-xs"><ImagePlus className="h-4 w-4" />Browse</button></div>
    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"><div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"><div className="mb-4 flex justify-between"><h2 className="font-bold text-navy-900">{title}</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close media picker"><X className="h-5 w-5" /></button></div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">PipeFlow illustrations</p><div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-5">{BUILT_IN.map(([src, name]) => <button type="button" key={src} onClick={() => { onChange(src); setOpen(false) }} className="overflow-hidden rounded-xl border border-neutral-200 text-left hover:border-brand-blue"><span className="relative block aspect-video bg-neutral-100"><Image src={src} alt={name} fill sizes="160px" className="object-cover" /></span><span className="block truncate p-1.5 text-xs">{name}</span></button>)}</div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Your uploads</p>{error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}{loading ? <p className="text-sm text-neutral-500">Loading media…</p> : items.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.map((item) => <button type="button" key={item.id} onClick={() => { onChange(item.url); setOpen(false) }} className="overflow-hidden rounded-xl border border-neutral-200 text-left hover:border-brand-blue"><span className="relative block aspect-video bg-neutral-100"><Image src={item.url} alt={item.alt_text || item.filename} fill sizes="220px" className="object-cover" /></span><span className="block truncate p-2 text-xs">{item.filename}</span></button>)}</div> : <p className="text-sm text-neutral-500">No uploaded media yet. Upload an image in the Media Library first.</p>}</div></div>}
  </>
}
