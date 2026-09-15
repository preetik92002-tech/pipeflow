'use client'

import { useState } from 'react'
import {
  HardHat,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react'

interface ProAppItem {
  id: string
  name: string
  company?: string
  phone: string
  email: string
  trade: 'plumbing' | 'hvac' | 'both'
  experience: string
  serviceAreas: string[]
  licenseInfo: string
  insuranceInfo: string
  status: 'new' | 'under_review' | 'contacted' | 'approved' | 'rejected' | 'onboarding'
  createdAt: string
  message?: string
}

const sampleApps: ProAppItem[] = [
  {
    id: 'PRO-1092',
    name: 'Robert Jenkins',
    company: 'Jenkins Plumbing & Drain LLC',
    phone: '(720) 555-0144',
    email: 'r.jenkins@example.com',
    trade: 'plumbing',
    experience: '5-10 years',
    serviceAreas: ['Denver', 'Aurora', 'Centennial'],
    licenseInfo: 'CO-PLM-88219 (Master Plumber)',
    insuranceInfo: 'Liberty Mutual GL #992144',
    status: 'under_review',
    createdAt: '2025-02-24T10:00:00Z',
    message: '10 years residential experience in Denver metro. Fully equipped van and drain hydro-jetter.',
  },
]

export default function AdminProApplicationsPage() {
  const [apps, setApps] = useState<ProAppItem[]>(sampleApps)
  const [selectedApp, setSelectedApp] = useState<ProAppItem | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const handleUpdateStatus = (appId: string, nextStatus: ProAppItem['status']) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a))
    )
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp((prev) => (prev ? { ...prev, status: nextStatus } : null))
    }
  }

  const filteredApps = apps.filter(
    (a) => statusFilter === 'all' || a.status === statusFilter
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-navy-900">Trade Contractor Applications</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review qualified plumbers and HVAC technicians applying to join the PipeFlow network.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">License / Verification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-navy-900">
                    <div>{app.name}</div>
                    <div className="text-2xs font-normal text-neutral-400">{app.company || app.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold uppercase text-brand-blue">{app.trade}</td>
                  <td className="py-3.5 px-4 text-neutral-600">{app.experience}</td>
                  <td className="py-3.5 px-4 text-neutral-600 font-mono text-2xs">{app.licenseInfo}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase ${
                        app.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'under_review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="btn-outline !py-1.5 !px-3 text-xs"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-2xs font-mono text-neutral-400">{selectedApp.id}</span>
                <h3 className="text-xl font-bold font-display text-navy-900">{selectedApp.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-1 text-neutral-400 hover:text-navy-900 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
              <span className="font-bold text-navy-900">Application Status:</span>
              <select
                value={selectedApp.status}
                onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value as ProAppItem['status'])}
                className="rounded-lg border border-neutral-300 px-3 py-1 bg-white font-semibold"
              >
                <option value="new">New</option>
                <option value="under_review">Under Review</option>
                <option value="contacted">Contacted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>

            <div className="space-y-2 text-xs text-neutral-700">
              <p><strong>Company:</strong> {selectedApp.company || 'Independent tradesperson'}</p>
              <p><strong>Phone:</strong> <a href={`tel:${selectedApp.phone}`} className="text-brand-blue font-semibold">{selectedApp.phone}</a></p>
              <p><strong>Email:</strong> {selectedApp.email}</p>
              <p><strong>License:</strong> {selectedApp.licenseInfo}</p>
              <p><strong>Insurance:</strong> {selectedApp.insuranceInfo}</p>
              <p><strong>Territories:</strong> {selectedApp.serviceAreas.join(', ')}</p>
              {selectedApp.message && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 mt-2">
                  <p className="font-bold text-navy-900 mb-1">Cover Note:</p>
                  <p>{selectedApp.message}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="btn-primary !py-2 !px-5 text-xs"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
