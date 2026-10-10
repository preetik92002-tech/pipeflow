'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatShortDate } from '@/lib/date'
import type { PageContent, RevisionSummary } from '@/lib/cms-pages/repository'

export function VersionHistory({ pageId, isOpen, onClose, onRestore }: { pageId: string; isOpen: boolean; onClose: () => void; onRestore: (content: PageContent) => void }) {
  const [items, setItems] = useState<RevisionSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setItems(null)
    setError(null)
    void (async () => {
      try {
        const res = await fetch(`/api/admin/pages/${pageId}/revisions`, { cache: 'no-store' })
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Unable to load history.')
        setItems(body.items)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load history.')
      }
    })()
  }, [isOpen, pageId])

  async function restore(number: number) {
    setBusy(number)
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/revisions?number=${number}`, { cache: 'no-store' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Unable to load that version.')
      onRestore(body.revision as PageContent)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load that version.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version history" size="md">
      <p className="mb-3 text-sm text-neutral-600">Every save is kept. Loading an old version puts it in the editor. Nothing changes on the live site until you save and publish.</p>
      {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {!items && !error && <p className="text-sm text-neutral-500">Loading…</p>}
      <ul className="max-h-[50vh] divide-y divide-neutral-100 overflow-y-auto">
        {items?.map((r) => (
          <li key={r.number} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy-800">Version {r.number} · {r.title}</p>
              <p className="text-2xs text-neutral-500">
                {formatShortDate(r.createdAt)}
                {r.isPublished && <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 font-semibold text-green-800">Live</span>}
                {r.isCurrentDraft && <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-800">Current draft</span>}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" loading={busy === r.number} disabled={busy !== null || r.isCurrentDraft} onClick={() => void restore(r.number)}>Load</Button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
