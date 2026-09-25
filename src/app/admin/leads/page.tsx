'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  X,
} from 'lucide-react'

interface LeadItem {
  id: string
  displayId: string
  recordKind: 'lead' | 'booking'
  name: string
  phone: string
  email: string
  category: 'plumbing' | 'hvac'
  service: string
  zipCode: string
  serviceArea: string
  leadType: 'Service Request' | 'Booking Request' | 'Quote Request' | 'Contact'
  status: 'New' | 'Contacted' | 'Qualified' | 'Scheduled' | 'In Progress' | 'Closed Won' | 'Closed Lost' | 'Spam' | 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled'
  isEmergency: boolean
  message?: string
  preferredDate?: string
  preferredTime?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  gclid?: string
  fbclid?: string
  landingPage?: string
  referrer?: string
  createdAt: string
  notes: string[]
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null)
  const [newNote, setNewNote] = useState('')

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/leads', { cache: 'no-store' })
      const result: { leads?: Array<Record<string, unknown> & { id: string; lead_id: string; record_kind: 'lead' | 'booking'; lead_notes?: Array<{ content: string }> }>; error?: string } = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load leads.')
      const title = (value: unknown) => String(value || 'new').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
      setLeads((result.leads ?? []).map((row) => ({
        id: row.id, displayId: row.lead_id, recordKind: row.record_kind, name: String(row.name || ''), phone: String(row.phone || ''), email: String(row.email || ''),
        category: String(row.service_category || 'service') as LeadItem['category'], service: String(row.specific_service || row.service_category || 'General inquiry'),
        zipCode: String(row.zip_code || ''), serviceArea: String(row.service_area || ''), leadType: title(row.lead_type) as LeadItem['leadType'], status: title(row.status) as LeadItem['status'],
        isEmergency: Boolean(row.is_emergency), message: typeof row.message === 'string' ? row.message : undefined,
        preferredDate: typeof row.preferred_date === 'string' ? row.preferred_date : undefined, preferredTime: typeof row.preferred_time === 'string' ? row.preferred_time : undefined,
        utmSource: typeof row.utm_source === 'string' ? row.utm_source : undefined, utmMedium: typeof row.utm_medium === 'string' ? row.utm_medium : undefined,
        utmCampaign: typeof row.utm_campaign === 'string' ? row.utm_campaign : undefined, gclid: typeof row.gclid === 'string' ? row.gclid : undefined,
        fbclid: typeof row.fbclid === 'string' ? row.fbclid : undefined, landingPage: typeof row.landing_page === 'string' ? row.landing_page : undefined,
        referrer: typeof row.referrer === 'string' ? row.referrer : undefined, createdAt: String(row.created_at || ''),
        notes: (row.lead_notes ?? []).map((note) => note.content),
      })))
      setLoadError(null)
    } catch (error) { setLoadError(error instanceof Error ? error.message : 'Unable to load leads.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadLeads() }, [loadLeads])

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesType = typeFilter === 'all' || lead.leadType === typeFilter
    const matchesSearch =
      !search.trim() ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.service.toLowerCase().includes(search.toLowerCase()) ||
      lead.zipCode.includes(search)
    return matchesStatus && matchesType && matchesSearch
  })

  const handleUpdateStatus = async (leadId: string, nextStatus: LeadItem['status']) => {
    setSaving(true); setMutationError(null)
    try {
      const target = leads.find((lead) => lead.id === leadId)
      const response = await fetch(`/api/admin/leads?id=${encodeURIComponent(leadId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus.toLowerCase().replaceAll(' ', '_'), recordKind: target?.recordKind }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to update lead status.')
      await loadLeads()
      setSelectedLead((current) => current ? { ...current, status: nextStatus } : current)
    } catch (error) { setMutationError(error instanceof Error ? error.message : 'Unable to update lead status.') }
    finally { setSaving(false) }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedLead) return
    setSaving(true); setMutationError(null)
    try {
      const response = await fetch(`/api/admin/leads?id=${encodeURIComponent(selectedLead.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: newNote.trim(), recordKind: selectedLead.recordKind }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save internal note.')
      setNewNote(''); await loadLeads()
      setSelectedLead((current) => current ? { ...current, notes: [...current.notes, newNote.trim()] } : current)
    } catch (error) { setMutationError(error instanceof Error ? error.message : 'Unable to save internal note.') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-navy-900">Lead CRM &amp; Dispatch</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track inquiries, update lead lifecycle statuses, view marketing attribution, and log notes.
          </p>
        </div>

        <button type="button" onClick={() => void loadLeads()} className="btn-outline !py-2 !px-4 text-xs self-start sm:self-auto">Refresh records</button>
      </div>

      {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{loadError}</p>}
      {mutationError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{mutationError}</p>}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, service, or ZIP code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-xs bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
            <option value="Spam">Spam</option>
            <option value="Requested">Requested</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-xs bg-white"
          >
            <option value="all">All Lead Types</option>
            <option value="Service Request">Service Request</option>
            <option value="Booking Request">Booking Request</option>
            <option value="Quote Request">Quote Request</option>
            <option value="Contact">Contact</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Lead ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service &amp; Trade</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Source / Attribution</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-2xs text-neutral-500">
                    {lead.displayId}
                    {lead.isEmergency && (
                      <span className="block text-brand-red font-bold font-sans">🚨 Emergency</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-navy-900">
                    <div>{lead.name}</div>
                    <div className="text-2xs font-normal text-neutral-400">{lead.phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-neutral-800">{lead.service}</div>
                    <div className="text-2xs text-neutral-400 uppercase">{lead.category}</div>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 font-mono text-2xs">
                    {[lead.serviceArea, lead.zipCode].filter(Boolean).join(' · ') || 'Not provided'}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '—'}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-2xs font-medium">
                      {lead.utmSource ? `${lead.utmSource} / ${lead.utmMedium || 'cpc'}` : 'Direct Website'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                        lead.status === 'New'
                          ? 'bg-blue-100 text-brand-blue'
                          : lead.status === 'Scheduled'
                          ? 'bg-purple-100 text-purple-800'
                          : lead.status === 'Closed Won'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-brand-blue font-bold">
                    View &rarr;
                  </td>
                </tr>
              ))}
              {!loading && !loadError && filteredLeads.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-sm text-neutral-500">No matching customer requests.</td></tr>}
              {loading && <tr><td colSpan={8} className="p-8 text-center text-sm text-neutral-500">Loading customer requests…</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6 animate-slide-up">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-2xs font-mono text-neutral-400 uppercase">{selectedLead.displayId} · {selectedLead.leadType}</span>
                <h2 className="text-xl font-bold font-display text-navy-900">{selectedLead.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-2 text-neutral-400 hover:text-navy-900 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Change Bar */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-navy-900">Lead Lifecycle Status:</span>
              <select
                value={selectedLead.status}
                onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value as LeadItem['status'])}
                disabled={saving}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold bg-white"
              >
                {selectedLead.recordKind === 'booking' ? <><option value="Requested">Requested</option><option value="Confirmed">Confirmed</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></> : <><option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
                <option value="Spam">Spam</option></>}
              </select>
            </div>

            {/* Customer & Service Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-neutral-200 space-y-1">
                <p className="text-2xs font-bold text-neutral-400 uppercase">Phone</p>
                <a href={`tel:${selectedLead.phone}`} className="font-bold text-brand-blue hover:underline">
                  {selectedLead.phone}
                </a>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 space-y-1">
                <p className="text-2xs font-bold text-neutral-400 uppercase">Email</p>
                <a href={`mailto:${selectedLead.email}`} className="font-bold text-navy-900 truncate block">
                  {selectedLead.email || 'None provided'}
                </a>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 space-y-1">
                <p className="text-2xs font-bold text-neutral-400 uppercase">Service Trade</p>
                <p className="font-bold text-navy-900">{selectedLead.service}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 space-y-1">
                <p className="text-2xs font-bold text-neutral-400 uppercase">ZIP Code</p>
                <p className="font-bold text-navy-900">{selectedLead.zipCode}, CO</p>
              </div>
            </div>

            {/* Message / Problem Description */}
            {selectedLead.message && (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                <p className="font-bold text-navy-900 mb-1">Customer Message / Problem:</p>
                <p className="text-neutral-700 leading-relaxed">{selectedLead.message}</p>
              </div>
            )}

            {/* Marketing Attribution Card */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <p className="font-bold text-navy-900">Marketing &amp; Campaign Attribution:</p>
              <div className="grid grid-cols-2 gap-2 text-2xs text-neutral-600">
                <p><strong>UTM Source:</strong> {selectedLead.utmSource || 'direct'}</p>
                <p><strong>UTM Medium:</strong> {selectedLead.utmMedium || 'none'}</p>
                <p><strong>Campaign:</strong> {selectedLead.utmCampaign || 'none'}</p>
                <p><strong>Landing:</strong> {selectedLead.landingPage || '/'}</p>
                {selectedLead.gclid && <p className="col-span-2 font-mono"><strong>GCLID:</strong> {selectedLead.gclid}</p>}
                {selectedLead.fbclid && <p className="col-span-2 font-mono"><strong>FBCLID:</strong> {selectedLead.fbclid}</p>}
              </div>
            </div>

            {/* Timeline Notes */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-navy-900">Dispatcher &amp; Internal Notes:</p>
              <div className="space-y-2">
                {selectedLead.notes.map((note, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-100 text-xs text-neutral-700">
                    {note}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add internal dispatch note..."
                  className="form-input text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="btn-primary !py-2 !px-4 text-xs whitespace-nowrap"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
