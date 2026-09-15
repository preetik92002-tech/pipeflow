'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  Download,
} from 'lucide-react'

interface LeadItem {
  id: string
  name: string
  phone: string
  email: string
  category: 'plumbing' | 'hvac'
  service: string
  zipCode: string
  leadType: 'Service Request' | 'Booking Request' | 'Quote Request' | 'Contact'
  status: 'New' | 'Contacted' | 'Qualified' | 'Scheduled' | 'In Progress' | 'Closed Won' | 'Closed Lost' | 'Spam'
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

const initialLeads: LeadItem[] = [
  {
    id: 'LD-98214',
    name: 'Sarah Miller',
    phone: '(720) 555-0199',
    email: 'sarah.miller@example.com',
    category: 'plumbing',
    service: 'Water Heater Replacement',
    zipCode: '80202',
    leadType: 'Booking Request',
    status: 'New',
    isEmergency: false,
    message: 'Water heater is 12 years old, making popping sounds and leaking around bottom.',
    preferredDate: '2025-02-28',
    preferredTime: 'morning',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'denver_water_heater_lead_gen',
    gclid: 'CjwKCAiA_SAMPLE_GCLID_123',
    landingPage: '/services/plumbing/water-heater',
    referrer: 'https://google.com',
    createdAt: '2025-02-25T14:30:00Z',
    notes: ['Initial request logged from homepage guided booking funnel.'],
  },
  {
    id: 'LD-98213',
    name: 'Michael Davis',
    phone: '(720) 555-0144',
    email: 'm.davis@example.com',
    category: 'hvac',
    service: 'Furnace Emergency Heating Repair',
    zipCode: '80014',
    leadType: 'Service Request',
    status: 'Contacted',
    isEmergency: true,
    message: 'Furnace blowing cold air during sub-zero freeze. House at 54 degrees.',
    utmSource: 'meta',
    utmMedium: 'paid_social',
    utmCampaign: 'colorado_winter_freeze_alert',
    fbclid: 'fb.1.123456789.SAMPLE',
    landingPage: '/',
    referrer: 'https://facebook.com',
    createdAt: '2025-02-25T11:15:00Z',
    notes: ['Technician Dave dispatched to Aurora address.'],
  },
]

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null)
  const [newNote, setNewNote] = useState('')

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

  const handleUpdateStatus = (leadId: string, nextStatus: LeadItem['status']) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    )
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: nextStatus } : null))
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedLead) return
    const updatedNotes = [...selectedLead.notes, `[${new Date().toLocaleDateString()}] ${newNote.trim()}`]
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: updatedNotes } : l))
    )
    setSelectedLead({ ...selectedLead, notes: updatedNotes })
    setNewNote('')
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

        <button
          type="button"
          onClick={() => alert('Exporting leads to CSV...')}
          className="btn-outline !py-2 !px-4 text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          Export Leads CSV
        </button>
      </div>

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
                    {lead.id}
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
                    ZIP: {lead.zipCode}
                  </td>
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
                <span className="text-2xs font-mono text-neutral-400 uppercase">{selectedLead.id}</span>
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
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold bg-white"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
                <option value="Spam">Spam</option>
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
