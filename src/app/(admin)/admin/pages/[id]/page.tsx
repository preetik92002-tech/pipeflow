import { PageEditor } from '@/components/admin/pages/PageEditor'

export const metadata = { title: 'Edit page · PipeFlow Admin' }

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PageEditor pageId={id} />
}
