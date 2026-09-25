'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ExternalLink, Edit, Archive, CheckCircle2 } from 'lucide-react'
import type { CmsBlog } from '@/lib/cms/types'

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<CmsBlog[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/cms/blog', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load articles.')
      setPosts(result.items as CmsBlog[])
      setError(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load articles.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const visiblePosts = useMemo(() => posts.filter((post) =>
    (status === 'all' || post.status === status) &&
    (!search || `${post.title} ${post.author}`.toLowerCase().includes(search.toLowerCase())),
  ), [posts, status, search])

  async function setPostStatus(post: CmsBlog, next: CmsBlog['status']) {
    const response = await fetch(`/api/admin/cms/blog?id=${encodeURIComponent(post.id)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, status: next, published_at: next === 'published' ? (post.published_at || new Date().toISOString()) : post.published_at }),
    })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to update article.'); return }
    await load()
  }

  async function archivePost(id: string) {
    const response = await fetch(`/api/admin/cms/blog?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Unable to archive article.'); return }
    await load()
  }

  return <div className="space-y-6">
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-navy-900">Blog Publications &amp; SEO</h1><p className="text-xs text-neutral-500 mt-1">Manage drafts and published articles stored in Supabase.</p></div>
      <Link href="/admin/new-blog" className="btn-primary !py-2.5 !px-5 text-xs inline-flex items-center gap-1.5"><Plus className="h-4 w-4" />Write New Article</Link>
    </header>
    <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-neutral-200 p-4">
      <label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles" className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 text-sm" /></label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"><option value="all">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option><option value="archived">Archived</option></select>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">{error}</p>}
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-xs">
      <thead className="bg-neutral-50 text-neutral-500 uppercase"><tr><th className="p-4">Article</th><th className="p-4">Author</th><th className="p-4">Status</th><th className="p-4">Published</th><th className="p-4 text-right">Actions</th></tr></thead>
      <tbody className="divide-y divide-neutral-100">{loading ? <tr><td colSpan={5} className="p-8 text-center text-neutral-500">Loading articles…</td></tr> : visiblePosts.length ? visiblePosts.map((post) => <tr key={post.id}>
        <td className="p-4"><p className="font-semibold text-navy-900">{post.title}</p><p className="font-mono text-neutral-400 mt-1">/blog/{post.slug}</p></td><td className="p-4">{post.author}</td><td className="p-4"><span className="capitalize">{post.status}</span></td><td className="p-4">{post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}</td>
        <td className="p-4 text-right whitespace-nowrap space-x-2">{post.status === 'published' && <Link href={`/blog/${post.slug}`} target="_blank" aria-label="View article" className="inline-flex p-1.5 text-neutral-500"><ExternalLink className="h-4 w-4" /></Link>}<Link href={`/admin/blogs/${post.id}/edit`} aria-label="Edit article" className="inline-flex p-1.5 text-brand-blue"><Edit className="h-4 w-4" /></Link><button onClick={() => void setPostStatus(post, post.status === 'published' ? 'draft' : 'published')} aria-label={post.status === 'published' ? 'Unpublish article' : 'Publish article'} className="inline-flex p-1.5 text-emerald-700"><CheckCircle2 className="h-4 w-4" /></button><button onClick={() => void archivePost(post.id)} aria-label="Archive article" className="inline-flex p-1.5 text-brand-red"><Archive className="h-4 w-4" /></button></td>
      </tr>) : <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No articles found.</td></tr>}</tbody>
    </table></div></div>
  </div>
}
