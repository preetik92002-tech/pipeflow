'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { DEFAULT_NAVIGATION, type NavLink, type Navigation } from '@/lib/cms-pages/navigation-schema'
import { ListEditor, TextField } from './pages/fields'

const GROUPS: Array<{ key: Exclude<keyof Navigation, 'cta'>; title: string; hint: string; max: number }> = [
  { key: 'header', title: 'Top menu', hint: 'Shown across the top of every page (up to 8).', max: 8 },
  { key: 'footerServices', title: 'Footer: Services', hint: 'Your service pages.', max: 12 },
  { key: 'footerAreas', title: 'Footer: Locations and Commercial', hint: 'City pages and commercial pages. City pages help local search.', max: 12 },
  { key: 'footerCompany', title: 'Footer: Find a Pro and Company', hint: 'Directory, contractors and contact.', max: 12 },
  { key: 'footerResources', title: 'Footer: Resources', hint: 'Blog, guides, requests.', max: 12 },
]

export function NavigationEditor() {
  const [nav, setNav] = useState<Navigation | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const n = await fetch('/api/admin/navigation', { cache: 'no-store' })
        const nb = await n.json()
        if (!n.ok) throw new Error(nb.error)
        setNav(nb.navigation)
      } catch (e) {
        setToast({ message: e instanceof Error ? e.message : 'Unable to load navigation.', type: 'error' })
        setNav(DEFAULT_NAVIGATION)
      }
    })()
  }, [])

  async function save() {
    if (!nav) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/navigation', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nav) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Unable to save.')
      setToast({ message: 'Navigation saved. It is live now.', type: 'success' })
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : 'Unable to save.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (!nav) return <p className="text-sm text-neutral-500">Loading…</p>

  const linkEditor = (items: NavLink[], onChange: (i: NavLink[]) => void, max: number) => (
    <ListEditor<NavLink>
      items={items} onChange={onChange} max={max} itemLabel="Link" addLabel="Add link"
      newItem={() => ({ label: '', href: '' })}
      render={(l, update) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Text" value={l.label} onChange={(label) => update({ label })} max={60} />
          <div>
            <TextField label="Goes to" value={l.href} onChange={(href) => update({ href })} placeholder="/plumbing or https://…" />
          </div>
        </div>
      )}
    />
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Navigation</h1>
          <p className="text-sm text-neutral-500">Control the menus on the public site. Changes go live when you press Save.</p>
        </div>
        <Button onClick={() => void save()} loading={saving} leftIcon={<Save className="h-4 w-4" />}>Save navigation</Button>
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <h2 className="font-bold text-navy-900">Main button</h2>
        <p className="mb-3 text-xs text-neutral-500">The red button in the top bar and on mobile.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Button text" value={nav.cta.label} onChange={(label) => setNav({ ...nav, cta: { ...nav.cta, label } })} max={40} />
          <TextField label="Goes to" value={nav.cta.href} onChange={(href) => setNav({ ...nav, cta: { ...nav.cta, href } })} />
        </div>
      </section>
      {GROUPS.map((g) => (
        <section key={g.key} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <h2 className="font-bold text-navy-900">{g.title}</h2>
          <p className="mb-3 text-xs text-neutral-500">{g.hint}</p>
          {linkEditor(nav[g.key], (items) => setNav({ ...nav, [g.key]: items }), g.max)}
        </section>
      ))}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
