'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, ExternalLink, FilePlus2, Pencil, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { joinPath, pathToUrl, slugify, splitPath, validatePath } from '@/lib/cms-pages/paths'
import { filterPages, PAGE_LIST_LIMIT, summarize } from '@/lib/cms-pages/page-list'
import type { PageListItem } from '@/lib/cms-pages/repository'
import { inputCls, SelectField, TextField } from './fields'
import { StatusBadge } from './StatusBadge'

type ToastState = { message: string; type: 'success' | 'error' } | null

export function PagesList() {
  const router = useRouter()
  const [items, setItems] = useState<PageListItem[] | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [location, setLocation] = useState('all')
  const [toast, setToast] = useState<ToastState>(null)
  const [creating, setCreating] = useState(false)
  const [toDelete, setToDelete] = useState<PageListItem | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const params = new URLSearchParams({ status })
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/admin/pages?${params}`, { cache: 'no-store' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Unable to load pages.')
      setItems(body.items as PageListItem[])
      setTruncated(body.truncated === true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load pages.')
    }
  }, [search, status])

  useEffect(() => {
    const t = setTimeout(() => void load(), search ? 250 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  async function duplicate(page: PageListItem) {
    setBusyId(page.id)
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/duplicate`, { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not duplicate.')
      router.push(`/admin/pages/${body.id}`)
    } catch (e) {
      setToast({ type: 'error', message: e instanceof Error ? e.message : 'Could not duplicate.' })
      setBusyId(null)
    }
  }

  async function remove(page: PageListItem) {
    setBusyId(page.id)
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, { method: 'DELETE' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not delete.')
      setToast({ type: 'success', message: `Deleted “${page.title}”.` })
      setToDelete(null)
      await load()
    } catch (e) {
      setToast({ type: 'error', message: e instanceof Error ? e.message : 'Could not delete.' })
    } finally {
      setBusyId(null)
    }
  }

  // Category aur city URL se nikalte hain, isliye filter browser mein hi lagta hai.
  const shown = useMemo(() => (items ? filterPages(items, { category, location }) : null), [items, category, location])
  const filtered = search !== '' || status !== 'all' || category !== 'all' || location !== 'all'
  const summary = shown ? summarize(shown, { filtered, truncated, limit: PAGE_LIST_LIMIT }) : 'Loading…'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-800">Pages</h1>
          <p className="text-sm text-neutral-600">{summary}</p>
        </div>
        <Button type="button" onClick={() => setCreating(true)} leftIcon={<FilePlus2 className="h-4 w-4" />}>New page</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or URL" aria-label="Search pages" className={`${inputCls} pl-9`} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={`${inputCls} sm:w-48`}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="unpublished">Unpublished</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by service category" className={`${inputCls} sm:w-44`}>
          <option value="all">All categories</option>
          <option value="plumbing">Plumbing</option>
          <option value="hvac">HVAC</option>
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Filter by location" className={`${inputCls} sm:w-40`}>
          <option value="all">All locations</option>
          <option value="denver">Denver</option>
          <option value="boulder">Boulder</option>
        </select>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} <button type="button" onClick={() => void load()} className="font-semibold underline">Try again</button></div>}

      {items === null && !error ? (
        <div className="space-y-2" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-200" />)}</div>
      ) : shown && shown.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="font-semibold text-navy-800">{filtered ? 'No pages match your filters.' : 'No pages yet.'}</p>
          {!filtered && <Button type="button" className="mt-4" onClick={() => setCreating(true)}>Create your first page</Button>}
        </div>
      ) : (
        shown && (
          <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">All pages</caption>
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Page</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Last changed</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {shown.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pages/${p.id}`} className="font-semibold text-navy-800 hover:text-brand-blue">{p.title}</Link>
                      {p.isTemplate && <span className="ml-2 rounded bg-purple-50 px-1.5 py-0.5 text-2xs font-semibold text-purple-700">Template</span>}
                      <div className="text-xs text-neutral-500">{pathToUrl(p.path)}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} unpublishedChanges={p.hasUnpublishedChanges} /></td>
                    <td className="px-4 py-3 text-neutral-600">{new Date(p.updatedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {p.status === 'published' && <a href={pathToUrl(p.path)} target="_blank" rel="noopener noreferrer" aria-label={`View ${p.title} live`} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"><ExternalLink className="h-4 w-4" /></a>}
                        <Link href={`/admin/pages/${p.id}`} aria-label={`Edit ${p.title}`} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"><Pencil className="h-4 w-4" /></Link>
                        <button type="button" onClick={() => void duplicate(p)} disabled={busyId === p.id} aria-label={`Duplicate ${p.title}`} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"><Copy className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setToDelete(p)} disabled={busyId === p.id} aria-label={`Delete ${p.title}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <NewPageModal
        open={creating}
        onClose={() => setCreating(false)}
        existing={(items ?? []).map((i) => i.path)}
        onCreated={(id) => router.push(`/admin/pages/${id}`)}
      />

      <Modal isOpen={toDelete !== null} onClose={() => setToDelete(null)} title="Delete this page?" size="sm">
        <div className="space-y-4 p-6 text-sm text-neutral-700">
          <p><strong>{toDelete?.title}</strong> ({toDelete && pathToUrl(toDelete.path)}) will be removed{toDelete?.status === 'published' ? ' and stop being public' : ''}. Its address becomes free to use again.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button type="button" variant="danger" loading={busyId === toDelete?.id} onClick={() => toDelete && void remove(toDelete)}>Delete page</Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

function NewPageModal({ open, onClose, existing, onCreated }: { open: boolean; onClose: () => void; existing: string[]; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState('')
  const [parent, setParent] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setTitle(''); setParent(''); setSlug(''); setSlugTouched(false); setError(null) }
  }, [open])

  const parents = useMemo(() => {
    const set = new Set<string>([''])
    for (const p of existing) {
      if (p === '') continue
      const { parent: par } = splitPath(p)
      if (par) set.add(par)
      if (p.split('/').length < 4) set.add(p)
    }
    return [...set].sort()
  }, [existing])

  const path = joinPath(parent, slug)
  const pathError = slug ? validatePath(path) ?? (existing.includes(path) ? 'Another page already uses this address.' : null) : null

  async function create() {
    if (!title.trim()) return setError('Enter a title.')
    if (!slug) return setError('Enter a URL name.')
    if (pathError) return setError(pathError)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          path,
          sections: [{ id: crypto.randomUUID(), type: 'hero', data: { eyebrow: '', heading: title.trim(), subtitle: '', intro: '', image: '', buttons: [], align: 'left' } }],
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not create the page.')
      onCreated(body.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the page.')
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="New page" size="md">
      <form className="space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); void create() }}>
        <TextField label="Page title" value={title} onChange={(v) => { setTitle(v); if (!slugTouched) setSlug(slugify(v)) }} max={180} placeholder="Our Services" />
        <SelectField label="Under" value={parent} onChange={setParent} options={parents.map((p) => ({ value: p, label: p === '' ? 'Top level' : `/${p}` }))} />
        <TextField label="Page URL name" value={slug} onChange={(v) => { setSlugTouched(true); setSlug(slugify(v) || v.toLowerCase()) }} max={80} error={pathError ?? undefined} />
        <p className="text-xs text-neutral-600">Web address: <code className="rounded bg-neutral-100 px-1.5 py-0.5">{pathToUrl(path)}</code></p>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Create page</Button>
        </div>
      </form>
    </Modal>
  )
}
