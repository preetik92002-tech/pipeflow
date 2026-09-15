import Link from 'next/link'
import {
  Users,
  Calendar,
  FileText,
  HardHat,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Wrench,
} from 'lucide-react'
import { blogService } from '@/lib/blog/blogService'
import { siteConfig } from '@/lib/config/site'

export default function AdminDashboard() {
  const publishedBlogs = blogService.getPublishedPosts()

  const stats = [
    { label: 'New Leads', value: '1', change: '+1 today', icon: Users, color: 'text-brand-blue bg-blue-50' },
    { label: 'Booking Requests', value: '1', change: 'Active window', icon: Calendar, color: 'text-green-600 bg-green-50' },
    { label: 'Quote Inquiries', value: '0', change: '0 pending', icon: FileText, color: 'text-amber-600 bg-amber-50' },
    { label: 'Pro Applications', value: '1', change: 'Under review', icon: HardHat, color: 'text-purple-600 bg-purple-50' },
    { label: 'Published Blogs', value: String(publishedBlogs.length), change: 'Active in SEO', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Service Areas', value: String(siteConfig.defaultServiceAreas.length), change: 'Colorado front range', icon: Wrench, color: 'text-navy-900 bg-neutral-100' },
  ]

  const recentLeads = [
    {
      id: 'LD-98214',
      name: 'Sarah Miller',
      phone: '(720) 555-0199',
      service: 'Water Heater Replacement',
      area: 'Denver (80202)',
      type: 'Booking Request',
      status: 'New',
      time: '15 mins ago',
    },
    {
      id: 'LD-98213',
      name: 'Michael Davis',
      phone: '(720) 555-0144',
      service: 'Furnace No Heat',
      area: 'Aurora (80014)',
      type: 'Emergency Dispatch',
      status: 'Contacted',
      time: '2 hours ago',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-navy-900">
            Business Control Center
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time lead inquiries, booking requests, trade applications, and content operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/new-blog" className="btn-outline !py-2 !px-3.5 text-xs inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Article
          </Link>
          <Link href="/admin/leads" className="btn-primary !py-2 !px-4 text-xs inline-flex items-center gap-1.5">
            View All Leads
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-navy-900">{stat.value}</p>
                <p className="text-2xs text-neutral-500 mt-0.5">{stat.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout: Recent Leads & CMS Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Inquiries (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">Recent Customer Inquiries</h2>
              <p className="text-2xs text-neutral-400">Latest submissions across booking, quote, and emergency forms</p>
            </div>
            <Link href="/admin/leads" className="text-xs font-bold text-brand-blue hover:underline">
              View CRM &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 font-semibold uppercase tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-navy-900">{lead.name}</p>
                      <p className="text-2xs text-neutral-400">{lead.phone}</p>
                    </td>
                    <td className="py-3 px-3 text-neutral-700">{lead.service}</td>
                    <td className="py-3 px-3 text-neutral-600">{lead.area}</td>
                    <td className="py-3 px-3">
                      <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md text-2xs font-semibold">
                        {lead.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase ${
                          lead.status === 'New'
                            ? 'bg-blue-100 text-brand-blue'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-400">{lead.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CMS & Settings Quick Links (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-3">
            <h3 className="text-sm font-bold text-navy-900 border-b border-neutral-100 pb-2">
              Management Modules
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Leads & Marketing Attribution', href: '/admin/leads', desc: 'Track GCLID, UTMs & dispatch' },
                { label: 'Trade Contractor Applications', href: '/admin/pro-applications', desc: 'Review pro plumbers & HVAC mechanics' },
                { label: 'Blog & Editorial Engine', href: '/admin/blogs', desc: 'Manage articles, SEO & FAQs' },
                { label: 'Service Catalog', href: '/admin/services', desc: 'Edit pricing notes & descriptions' },
                { label: 'Service Areas & ZIP Codes', href: '/admin/service-areas', desc: 'Control Colorado territory routes' },
                { label: 'Global Business Settings', href: '/admin/settings', desc: 'Phone, email, hours, analytics' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block p-3 rounded-xl border border-neutral-100 hover:border-brand-blue/40 hover:bg-blue-50/30 transition-all text-left"
                >
                  <p className="text-xs font-bold text-navy-900">{link.label}</p>
                  <p className="text-2xs text-neutral-500 mt-0.5">{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
