'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDown, ArrowLeft, ArrowUp, ChevronDown, ChevronRight, ExternalLink, Eye, GripVertical, History, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { RESERVED_SEGMENTS, joinPath, pathToUrl, slugify, splitPath } from '@/lib/cms-pages/paths'
import { SECTION_TYPES, sectionMeta } from '@/lib/cms-pages/sections/registry'
import type { DraftSection, SectionType } from '@/lib/cms-pages/sections/schema'
import type { AdminPage } from '@/lib/cms-pages/repository'
import { Field, ImageField, inputCls, SelectField, TextField } from './fields'
import { VersionHistory } from './VersionHistory'
import { SectionForm, sectionSummary } from './SectionForms'
import { StatusBadge } from './StatusBadge'
import { NOINDEX_LABEL } from '@/lib/cms-pages/publish-checks'

type Issues = { path: string; message: string }[]
type ToastState = { message: string; type: 'success' | 'error' | 'info' } | null

const newId = () => crypto.randomUUID()

interface Props {
  pageId: string
}

export function PageEditor({ pageId }: Props) {
  const [page, setPage] = useState<AdminPage | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [knownPaths, setKnownPaths] = useState<string[]>([])

  const [title, setTitle] = useState('')
  const [parent, setParent] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  const [noindex, setNoindex] = useState(false)
  const [sections, setSections] = useState<DraftSection[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'unpublish'>(null)
  const [issues, setIssues] = useState<Issues>([])
  const [conflict, setConflict] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [confirm, setConfirm] = useState<null | 'publish' | 'unpublish'>(null)
  const [picker, setPicker] = useState(false)
  const [history, setHistory] = useState(false)
  const [recovered, setRecovered] = useState<null | { at: string; data: Record<string, unknown> }>(null)
  const backupKey = `pipeflow-page-backup-${pageId}`
  const loadedFor = useRef<string | null>(null)

  const applyPage = useCallback((p: AdminPage) => {
    setPage(p)
    setTitle(p.title)
    const { parent: par, slug: sl } = splitPath(p.path)
    setParent(par)
    setSlug(sl)
    setDescription(p.description ?? '')
    setSeoTitle(p.seoTitle ?? '')
    setSeoDescription(p.seoDescription ?? '')
    setOgImage(p.ogImage ?? '')
    setCanonicalUrl(p.canonicalUrl ?? '')
    setNoindex(p.noindex)
    setSections(Array.isArray(p.sections) ? (p.sections as DraftSection[]) : [])
    setDirty(false)
    setConflict(false)
    setIssues([])
  }, [])

  const load = useCallback(async () => {
    setLoadError(null)
    try {
      const [res, listRes] = await Promise.all([
        fetch(`/api/admin/pages/${pageId}`, { cache: 'no-store' }),
        fetch('/api/admin/pages', { cache: 'no-store' }),
      ])
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Unable to load this page.')
      applyPage(body.page as AdminPage)
      if (listRes.ok) setKnownPaths(((await listRes.json()).items as { path: string }[]).map((i) => i.path))
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Unable to load this page.')
    }
  }, [pageId, applyPage])

  useEffect(() => {
    if (loadedFor.current === pageId) return
    loadedFor.current = pageId
    void load()
  }, [pageId, load])

  // Keep a copy of unsaved edits in this browser, so a crash or closed tab does not lose them.
  useEffect(() => {
    if (!dirty || !page) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(backupKey, JSON.stringify({ baseVersion: page.version, at: new Date().toISOString(), data: { title, description, seoTitle, seoDescription, ogImage, canonicalUrl, noindex, sections } }))
      } catch { /* storage full or blocked: the backup is a convenience only */ }
    }, 1500)
    return () => clearTimeout(timer)
  }, [dirty, page, backupKey, title, description, seoTitle, seoDescription, ogImage, canonicalUrl, noindex, sections])

  useEffect(() => {
    if (!page || dirty) return
    try {
      const raw = localStorage.getItem(backupKey)
      if (!raw) return
      const b = JSON.parse(raw) as { baseVersion: number; at: string; data: Record<string, unknown> }
      if (b.baseVersion === page.version) setRecovered({ at: b.at, data: b.data })
      else localStorage.removeItem(backupKey)
    } catch { /* ignore a corrupt backup */ }
    // only when a page has just loaded or been saved
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.version, page?.id])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const isHome = page?.path === ''
  const path = isHome ? '' : joinPath(parent, slug)

  const parentOptions = useMemo(() => {
    const set = new Set<string>([''])
    for (const p of knownPaths) {
      if (p === '') continue
      const { parent: par } = splitPath(p)
      if (par) set.add(par)
      if (p.split('/').length < 4 && p !== page?.path) set.add(p)
    }
    if (parent) set.add(parent)
    return [...set].sort()
  }, [knownPaths, page?.path, parent])

  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setDirty(true)
  }

  const sectionErrors = useMemo(() => {
    const map: Record<string, Record<string, string>> = {}
    const general: string[] = []
    for (const issue of issues) {
      const m = issue.path.match(/^sections\.(\d+)(?:\.data)?\.?(.*)$/)
      if (m && sections[Number(m[1])]) {
        const id = sections[Number(m[1])].id
        ;(map[id] ??= {})[m[2]] = issue.message
      } else general.push(issue.path ? `${issue.path}: ${issue.message}` : issue.message)
    }
    return { map, general }
  }, [issues, sections])
  const fieldError = (name: string) => issues.find((i) => i.path === name)?.message

  async function save(): Promise<number | null> {
    if (!page) return null
    setBusy('save')
    setIssues([])
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: page.version, title, path, description, sections, seoTitle, seoDescription, ogImage, canonicalUrl, noindex,
        }),
      })
      const body = await res.json()
      if (res.status === 409 && body.code === 'conflict') {
        setConflict(true)
        return null
      }
      if (!res.ok) {
        setIssues(body.issues ?? [{ path: '', message: body.error || 'Could not save.' }])
        setToast({ type: 'error', message: body.error || 'Could not save.' })
        return null
      }
      setPage({ ...page, version: body.version, title, path, hasUnpublishedChanges: page.status === 'published' ? true : false })
      setDirty(false)
      try { localStorage.removeItem(backupKey) } catch { /* ignore */ }
      setRecovered(null)
      setToast({ type: 'success', message: 'Draft saved. Visitors still see the published version.' })
      return body.version as number
    } catch {
      setToast({ type: 'error', message: 'Could not reach the server. Your changes are still here, try again.' })
      return null
    } finally {
      setBusy(null)
    }
  }

  async function transition(action: 'publish' | 'unpublish') {
    if (!page) return
    setConfirm(null)
    let version = page.version
    if (dirty) {
      const saved = await save()
      if (saved === null) return
      version = saved
    }
    setBusy(action)
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      })
      const body = await res.json()
      if (res.status === 409 && body.code === 'conflict') {
        setConflict(true)
        return
      }
      if (!res.ok) {
        if (Array.isArray(body.issues)) setIssues(body.issues)
        setToast({ type: 'error', message: body.error || `Could not ${action}.` })
        return
      }
      setPage((p) => p && { ...p, version: body.version, status: action === 'publish' ? 'published' : 'unpublished', hasUnpublishedChanges: false, publishedAt: action === 'publish' ? new Date().toISOString() : p.publishedAt, publishedPath: path })
      setToast({ type: 'success', message: action === 'publish' ? 'Published. Visitors now see this version.' : 'Unpublished. The page is no longer public.' })
    } catch {
      setToast({ type: 'error', message: 'Could not reach the server. Try again.' })
    } finally {
      setBusy(null)
    }
  }

  async function preview() {
    if (!page) return
    if (dirty && (await save()) === null) return
    window.open(`/preview/${page.id}`, '_blank', 'noopener')
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    setSections((s) => arrayMove(s, s.findIndex((x) => x.id === e.active.id), s.findIndex((x) => x.id === e.over!.id)))
    setDirty(true)
  }

  const move = (i: number, to: number) => {
    if (to < 0 || to >= sections.length) return
    setSections((s) => arrayMove(s, i, to))
    setDirty(true)
  }

  function addSection(type: SectionType) {
    const meta = sectionMeta(type)
    if (!meta) return
    const section: DraftSection = { id: newId(), type, data: meta.defaults() }
    setSections((s) => [...s, section])
    setExpanded((x) => new Set(x).add(section.id))
    setDirty(true)
    setPicker(false)
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {loadError} <Link href="/admin/pages" className="font-semibold underline">Back to pages</Link>
      </div>
    )
  }
  if (!page) return <div className="space-y-4" aria-busy="true"><div className="h-12 animate-pulse rounded-xl bg-neutral-200" /><div className="h-64 animate-pulse rounded-xl bg-neutral-200" /></div>

  const published = page.status === 'published'
  const liveUrl = page.publishedPath !== null && published ? pathToUrl(page.path) : null

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-neutral-200 bg-neutral-100/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/pages" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-brand-blue"><ArrowLeft className="h-4 w-4" />Pages</Link>
          <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold text-navy-800">{title || 'Untitled page'}</h1>
          <StatusBadge status={page.status} unpublishedChanges={page.hasUnpublishedChanges || (published && dirty)} />
          {dirty && <span className="text-xs font-medium text-amber-700">Unsaved changes</span>}
          <div className="flex flex-wrap gap-2">
            {liveUrl && <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"><ExternalLink className="h-4 w-4" />View live</a>}
            <Button type="button" variant="ghost" size="md" onClick={() => setHistory(true)} disabled={busy !== null} leftIcon={<History className="h-4 w-4" />}>History</Button>
            <Button type="button" variant="outline" size="md" onClick={() => void preview()} disabled={busy !== null} leftIcon={<Eye className="h-4 w-4" />}>Preview</Button>
            <Button type="button" variant="secondary" size="md" onClick={() => void save()} loading={busy === 'save'} disabled={busy !== null || !dirty} leftIcon={<Save className="h-4 w-4" />}>Save draft</Button>
            {published && <Button type="button" variant="ghost" size="md" onClick={() => setConfirm('unpublish')} disabled={busy !== null}>Unpublish</Button>}
            {!page.isTemplate && <Button type="button" variant="primary" size="md" onClick={() => setConfirm('publish')} loading={busy === 'publish'} disabled={busy !== null || (published && !dirty && !page.hasUnpublishedChanges)}>{published ? 'Publish changes' : 'Publish'}</Button>}
          </div>
        </div>
      </div>

      {recovered && !dirty && (
        <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p><span className="font-semibold">Unsaved edits found.</span> We kept a copy from {new Date(recovered.at).toLocaleString()}.</p>
          <span className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => {
              const d = recovered.data as { title: string; description: string; seoTitle: string; seoDescription: string; ogImage: string; canonicalUrl: string; noindex: boolean; sections: DraftSection[] }
              setTitle(d.title); setDescription(d.description); setSeoTitle(d.seoTitle); setSeoDescription(d.seoDescription)
              setOgImage(d.ogImage); setCanonicalUrl(d.canonicalUrl); setNoindex(d.noindex); setSections(d.sections)
              setDirty(true); setRecovered(null)
            }}>Restore them</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { try { localStorage.removeItem(backupKey) } catch { /* ignore */ } setRecovered(null) }}>Discard</Button>
          </span>
        </div>
      )}

      {conflict && (
        <div role="alert" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">This page was changed by someone else since you opened it.</p>
          <p className="mt-1">Nothing was overwritten. Reload to see their version; your unsaved edits on this screen will be lost, so copy anything you want to keep first.</p>
          <Button type="button" className="mt-3" size="sm" variant="secondary" onClick={() => { loadedFor.current = null; void load() }}>Reload latest version</Button>
        </div>
      )}
      {sectionErrors.general.length > 0 && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Fix these before saving:</p>
          <ul className="mt-1 list-disc pl-5">{sectionErrors.general.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5" aria-labelledby="page-settings">
            <h2 id="page-settings" className="font-display text-base font-bold text-navy-800">Page</h2>
            <TextField label="Page title" value={title} onChange={edit(setTitle)} max={180} error={fieldError('title')} hint="Shown in the browser tab and used as the default search result title." />
            {isHome ? (
              <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">This is the homepage, at <code>/</code>. Its URL cannot be changed.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Under" value={parent} onChange={edit(setParent)} options={parentOptions.map((p) => ({ value: p, label: p === '' ? 'Top level' : `/${p}` }))} />
                <TextField label="Page URL name" value={slug} onChange={(v) => { setSlug(slugify(v) || v.toLowerCase()); setDirty(true) }} max={80} error={fieldError('path')} />
              </div>
            )}
            {!isHome && (
              <p className="text-xs text-neutral-600">
                Web address: <code className="rounded bg-neutral-100 px-1.5 py-0.5">{pathToUrl(path)}</code>
                {page.publishedPath !== null && path !== page.path && <span className="ml-2 font-medium text-amber-700">Changing the address of a live page keeps the old one working with a redirect.</span>}
              </p>
            )}
            {(RESERVED_SEGMENTS as readonly string[]).includes(path.split('/')[0]) && <p role="alert" className="text-xs font-medium text-red-700">“{path.split('/')[0]}” is reserved by the site.</p>}
            <TextField label="Short description (optional)" value={description} onChange={edit(setDescription)} max={320} multiline rows={2} hint="Used as the search result description if you do not set one under SEO." />
          </section>

          <section aria-labelledby="sections-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="sections-heading" className="font-display text-base font-bold text-navy-800">Sections <span className="text-sm font-normal text-neutral-500">({sections.length})</span></h2>
              <Button type="button" size="md" variant="secondary" onClick={() => setPicker(true)} leftIcon={<Plus className="h-4 w-4" />}>Add section</Button>
            </div>
            {sections.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-10 text-center">
                <p className="font-semibold text-navy-800">This page has no sections yet.</p>
                <p className="mt-1 text-sm text-neutral-600">Add a hero to start, then build the page one section at a time.</p>
                <Button type="button" className="mt-4" onClick={() => setPicker(true)} leftIcon={<Plus className="h-4 w-4" />}>Add the first section</Button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <ol className="space-y-3">
                    {sections.map((s, i) => (
                      <SectionCard
                        key={s.id}
                        section={s}
                        index={i}
                        count={sections.length}
                        open={expanded.has(s.id)}
                        errors={sectionErrors.map[s.id] ?? {}}
                        onToggle={() => setExpanded((x) => { const n = new Set(x); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n })}
                        onMove={(to) => move(i, to)}
                        onDelete={() => { setSections((all) => all.filter((x) => x.id !== s.id)); setDirty(true) }}
                        onChange={(data) => { setSections((all) => all.map((x) => (x.id === s.id ? { ...x, data } : x))); setDirty(true) }}
                      />
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </div>

        <aside className="space-y-6" aria-label="Search and sharing">
          <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="font-display text-base font-bold text-navy-800">Search engines</h2>
            <TextField label="SEO title" value={seoTitle} onChange={edit(setSeoTitle)} max={180} placeholder={title} hint="Leave empty to use the page title. About 60 characters works best." />
            <TextField label="SEO description" value={seoDescription} onChange={edit(setSeoDescription)} max={320} multiline rows={3} hint="About 150 to 160 characters works best." />
            <ImageField label="Share image" value={ogImage} onChange={edit(setOgImage)} hint="Shown when the page is shared on social media." />
            <TextField label="Canonical address (optional)" value={canonicalUrl} onChange={edit(setCanonicalUrl)} placeholder="https://" error={fieldError('canonicalUrl')} hint="Only set this if the same content lives at another address." />
            <Field label="Visibility">
              <label className="flex items-start gap-2 text-sm text-neutral-700">
                <input type="checkbox" checked={noindex} onChange={(e) => edit(setNoindex)(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-neutral-300" />
                <span>{NOINDEX_LABEL}</span>
              </label>
            </Field>
          </section>
          <p className="px-1 text-xs text-neutral-500">Last changed {new Date(page.updatedAt).toLocaleString()}. Saving a draft never changes the live page: only Publish does.</p>
        </aside>
      </div>

      <Modal isOpen={picker} onClose={() => setPicker(false)} title="Add a section" size="xl">
        <ul className="grid gap-3 p-6 sm:grid-cols-2">
          {SECTION_TYPES.map((t) => (
            <li key={t.type}>
              <button type="button" onClick={() => addSection(t.type)} className="h-full w-full rounded-xl border border-neutral-200 p-4 text-left transition hover:border-brand-blue hover:bg-blue-50/40">
                <span className="block font-semibold text-navy-800">{t.label}</span>
                <span className="mt-1 block text-xs text-neutral-600">{t.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      <VersionHistory
        pageId={pageId}
        isOpen={history}
        onClose={() => setHistory(false)}
        onRestore={(r) => {
          setTitle(r.title)
          setDescription(r.description ?? '')
          setSeoTitle(r.seoTitle ?? '')
          setSeoDescription(r.seoDescription ?? '')
          setOgImage(r.ogImage ?? '')
          setCanonicalUrl(r.canonicalUrl ?? '')
          setNoindex(r.noindex)
          setSections((Array.isArray(r.sections) ? (r.sections as DraftSection[]) : []).map((sec) => ({ ...sec, id: sec.id || newId() })))
          setDirty(true)
          setHistory(false)
          setToast({ type: 'info', message: 'Version loaded into the editor. Check it, then Save draft to keep it.' })
        }}
      />

      <Modal isOpen={confirm !== null} onClose={() => setConfirm(null)} title={confirm === 'publish' ? (published ? 'Publish your changes?' : 'Publish this page?') : 'Unpublish this page?'} size="sm">
        <div className="space-y-4 p-6 text-sm text-neutral-700">
          {confirm === 'publish' ? (
            <p>Visitors will see this version at <code className="rounded bg-neutral-100 px-1.5 py-0.5">{pathToUrl(path)}</code> right away{dirty ? ', including your unsaved edits, which will be saved first' : ''}.</p>
          ) : (
            <p>The page stops being public and its address will show “page not found”. Your content is kept and you can publish it again.</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button type="button" variant={confirm === 'publish' ? 'primary' : 'danger'} onClick={() => confirm && void transition(confirm)}>{confirm === 'publish' ? 'Publish' : 'Unpublish'}</Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

function SectionCard({
  section, index, count, open, errors, onToggle, onMove, onDelete, onChange,
}: {
  section: DraftSection; index: number; count: number; open: boolean; errors: Record<string, string>
  onToggle: () => void; onMove: (to: number) => void; onDelete: () => void; onChange: (data: Record<string, unknown>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const meta = sectionMeta(section.type)
  const summary = sectionSummary(section.type, section.data)
  const hasErrors = Object.keys(errors).length > 0
  const [confirmDelete, setConfirmDelete] = useState(false)
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border bg-white ${hasErrors ? 'border-red-300' : 'border-neutral-200'} ${isDragging ? 'z-20 shadow-xl' : ''}`}
    >
      <div className="flex items-center gap-2 p-3">
        <button type="button" {...attributes} {...listeners} aria-label={`Drag to reorder ${meta?.label ?? section.type} section ${index + 1}. Use arrow keys after pressing space.`} className="cursor-grab touch-none rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"><GripVertical className="h-5 w-5" /></button>
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          {open ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-neutral-500" /> : <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-500" />}
          <span className="rounded-md bg-navy-800 px-2 py-0.5 text-2xs font-bold uppercase tracking-wide text-white">{meta?.label ?? section.type}</span>
          <span className="truncate text-sm text-neutral-700">{summary}</span>
          {hasErrors && <span className="ml-auto flex-shrink-0 text-xs font-semibold text-red-700">Needs attention</span>}
        </button>
        <span className="flex flex-shrink-0 gap-0.5">
          <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} aria-label={`Move section ${index + 1} up`} className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
          <button type="button" onClick={() => onMove(index + 1)} disabled={index === count - 1} aria-label={`Move section ${index + 1} down`} className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
          <button type="button" onClick={() => setConfirmDelete(true)} aria-label={`Delete section ${index + 1}`} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </span>
      </div>
      {confirmDelete && (
        <div role="alertdialog" aria-label="Confirm delete section" className="mx-3 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-900">
          <span>Delete this {meta?.label.toLowerCase() ?? 'section'}? You can still leave the page without saving to undo.</span>
          <span className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Keep</Button>
            <Button type="button" size="sm" variant="danger" onClick={onDelete}>Delete</Button>
          </span>
        </div>
      )}
      {open && (
        <div className="border-t border-neutral-100 p-4">
          <SectionForm type={section.type} data={section.data} onChange={onChange} errors={errors} />
        </div>
      )}
    </li>
  )
}
