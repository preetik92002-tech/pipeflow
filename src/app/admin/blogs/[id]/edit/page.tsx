'use client'

import { useParams, notFound } from 'next/navigation'
import { blogService } from '@/lib/blog/blogService'
import { BlogEditor } from '@/components/admin/BlogEditor'

export default function EditBlogPage() {
  const params = useParams()
  const id = params?.id as string

  const post = blogService.getPostById(id)

  if (!post) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 m-6">
        <h2 className="text-lg font-bold text-navy-900 mb-2">Article Not Found</h2>
        <p className="text-xs text-neutral-500 mb-4">
          The requested article ID could not be located in the database.
        </p>
      </div>
    )
  }

  return <BlogEditor initialPost={post} isNew={false} />
}
