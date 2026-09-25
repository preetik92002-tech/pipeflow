'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

type ApplicationStatus = 'new' | 'under_review' | 'contacted' | 'approved' | 'rejected' | 'onboarding'
interface ProApplication {
  id: string; application_id: string; name: string; company: string | null; phone: string; email: string
  trade: 'plumbing' | 'hvac' | 'both'; experience: string | null; service_areas: string[] | null
  license_info: string | null; insurance_info: string | null; website: string | null; message: string | null
  document_name: string | null; status: ApplicationStatus; created_at: string
}

const statusLabels: Record<ApplicationStatus, string> = { new: 'New', under_review: 'Under Review', contacted: 'Contacted', approved: 'Approved', rejected: 'Rejected', onboarding: 'Onboarding' }

export default function AdminProApplicationsPage() {
  const [applications, setApplications] = useState<ProApplication[]>([])
  const [selected, setSelected] = useState<ProApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pro-applications', { cache: 'no-store' })
      const result: { applications?: ProApplication[]; error?: string } = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load applications.')
      setApplications(result.applications ?? []); setError(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load applications.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  async function updateStatus(application: ProApplication, status: ApplicationStatus) {
    setSaving(true); setError(null)
    try {
      const response = await fetch(`/api/pro-applications?id=${encodeURIComponent(application.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to update application.')
      await load()
      setSelected((current) => current ? { ...current, status } : null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update application.') }
    finally { setSaving(false) }
  }

  const filtered = applications.filter((app) => (statusFilter === 'all' || app.status === statusFilter) && (!search.trim() || `${app.name} ${app.company ?? ''} ${app.email} ${app.phone}`.toLowerCase().includes(search.toLowerCase())))

  return <div className="space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold font-display text-navy-900">Trade Contractor Applications</h1><p className="mt-1 text-xs text-neutral-500">Review submitted contractor applications and update their status.</p></div><div className="flex gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applicants" className="rounded-xl border border-neutral-200 px-3 py-2 text-xs" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs"><option value="all">All statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={() => void load()} className="btn-outline !px-3 !py-2 text-xs">Refresh</button></div></header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-neutral-200 bg-neutral-50 font-semibold uppercase tracking-wider text-neutral-500"><tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Trade</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">License</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Details</th></tr></thead><tbody className="divide-y divide-neutral-100">{filtered.map((app) => <tr key={app.id} className="hover:bg-neutral-50/70"><td className="px-4 py-3.5 font-bold text-navy-900"><div>{app.name}</div><div className="font-normal text-neutral-400">{app.company || app.email}</div></td><td className="px-4 py-3.5 font-semibold uppercase text-brand-blue">{app.trade}</td><td className="px-4 py-3.5 text-neutral-600">{app.experience || '—'}</td><td className="px-4 py-3.5 text-neutral-600">{app.license_info || '—'}</td><td className="px-4 py-3.5 text-neutral-500">{new Date(app.created_at).toLocaleString()}</td><td className="px-4 py-3.5">{statusLabels[app.status] || app.status}</td><td className="px-4 py-3.5 text-right"><button type="button" onClick={() => setSelected(app)} className="btn-outline !px-3 !py-1.5 text-xs">Review</button></td></tr>)}{loading && <tr><td colSpan={7} className="p-8 text-center text-sm text-neutral-500">Loading applications…</td></tr>}{!loading && !error && filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-sm text-neutral-500">No applications match this view.</td></tr>}</tbody></table></div></div>
    {selected && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="max-h-[90vh] w-full max-w-xl space-y-5 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-center justify-between border-b border-neutral-100 pb-3"><div><span className="font-mono text-2xs text-neutral-400">{selected.application_id}</span><h2 className="text-xl font-bold font-display text-navy-900">{selected.name}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close application details" className="rounded-lg p-1 text-neutral-400 hover:text-navy-900"><X className="h-5 w-5" /></button></div><label className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs font-bold">Application status<select disabled={saving} value={selected.status} onChange={(e) => void updateStatus(selected, e.target.value as ApplicationStatus)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 font-semibold">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="space-y-2 text-xs text-neutral-700"><p><strong>Company:</strong> {selected.company || 'Not provided'}</p><p><strong>Email:</strong> <a href={`mailto:${selected.email}`} className="text-brand-blue">{selected.email}</a></p><p><strong>Phone:</strong> <a href={`tel:${selected.phone}`} className="text-brand-blue">{selected.phone}</a></p><p><strong>Trade:</strong> {selected.trade}</p><p><strong>Experience:</strong> {selected.experience || 'Not provided'}</p><p><strong>Service areas:</strong> {selected.service_areas?.join(', ') || 'Not provided'}</p><p><strong>License:</strong> {selected.license_info || 'Not provided'}</p><p><strong>Insurance:</strong> {selected.insurance_info || 'Not provided'}</p><p><strong>Website:</strong> {selected.website || 'Not provided'}</p><p><strong>Document:</strong> {selected.document_name || 'None attached'}</p>{selected.message && <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3"><strong>Applicant message:</strong><p className="mt-1">{selected.message}</p></div>}<p><strong>Submitted:</strong> {new Date(selected.created_at).toLocaleString()}</p></div><div className="flex justify-end"><button type="button" onClick={() => setSelected(null)} className="btn-primary !px-5 !py-2 text-xs">Close</button></div></div></div>}
  </div>
}
