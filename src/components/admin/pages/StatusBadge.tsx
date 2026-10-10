import { Badge } from '@/components/ui/Badge'
import type { PageStatus } from '@/lib/cms-pages/repository'

export function StatusBadge({ status, unpublishedChanges = false }: { status: PageStatus; unpublishedChanges?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {status === 'published' && <Badge variant="green">Published</Badge>}
      {status === 'draft' && <Badge variant="yellow">Draft</Badge>}
      {status === 'unpublished' && <Badge variant="default">Unpublished</Badge>}
      {unpublishedChanges && <Badge variant="blue">Unpublished changes</Badge>}
    </span>
  )
}
