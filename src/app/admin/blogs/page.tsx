'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Archive,
} from 'lucide-react'
import { blogService } from '@/lib/blog/blogService'
import type { BlogPost, BlogStatus } from '@/lib/blog/types'

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>(() => blogService.getAllPosts())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const reloadPosts = () => {
    setPosts(blogService.getAllPosts())
  }

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    const matchesSearch =
      !search.trim() ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.author.toLowerCase().includes(search.toLowerCase()) ||
      post.categoryName.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleDelete = (id: string) => {
    blogService.deletePost(id)
    setDeleteConfirmId(null)
    reloadPosts()
  }

  const handleDuplicate = (id: string) => {
    blogService.duplicatePost(id)
    reloadPosts()
  }

  const handleTogglePublish = (id: string, currentStatus: BlogStatus) => {
    const nextStatus: BlogStatus = currentStatus === 'published' ? 'draft' : 'published'
    blogService.updateStatus(id, nextStatus)
    reloadPosts()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Blog Publications &amp; SEO Engine</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage educational articles, local Denver guides, SEO metadata, and publication statuses.
          </p>
        </div>

        <Link
          href="/admin/new-blog"
          className="btn-primary !py-2.5 !px-5 text-xs inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Write New Article
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 italic">
                    No articles found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-navy-900 max-w-sm">
                      <div className="truncate text-sm">{post.title}</div>
                      <div className="text-2xs text-neutral-400 font-mono mt-0.5 truncate">
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 font-medium whitespace-nowrap">
                      {post.categoryName}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 whitespace-nowrap">{post.author}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'archived'
                            ? 'bg-neutral-200 text-neutral-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                      {post.status === 'published' && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-blue hover:bg-neutral-100 inline-block transition-colors"
                          title="View Live Article"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}

                      <Link
                        href={`/admin/blogs/${post.id}/edit`}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-blue hover:bg-neutral-100 inline-block transition-colors"
                        title="Edit Article"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleTogglePublish(post.id, post.status)}
                        className={`p-1.5 rounded-lg inline-block transition-colors ${
                          post.status === 'published'
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-neutral-400 hover:text-green-600 hover:bg-neutral-100'
                        }`}
                        title={post.status === 'published' ? 'Unpublish to Draft' : 'Publish Article'}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(post.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-navy-900 hover:bg-neutral-100 inline-block transition-colors"
                        title="Duplicate Article"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(post.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-red hover:bg-red-50 inline-block transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-navy-900">Delete This Article?</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to delete this blog post? This action will permanently remove it
              from the publication and search engines.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="btn-outline !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn-primary !bg-brand-red hover:!bg-brand-red-dark !py-2 !px-4 text-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
