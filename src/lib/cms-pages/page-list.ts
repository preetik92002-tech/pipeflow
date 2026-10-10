import { classifyPath } from './paths'

/** The admin list shows at most this many pages per search; the API says when there were more. */
export const PAGE_LIST_LIMIT = 500

/** The fields of a page-list row these helpers need (a PageListItem has them all). */
export interface ListRow {
  path: string
  status: string
  isTemplate: boolean
}

export interface ListFilters {
  category: string
  location: string
}

/** Category and city come from the URL, so filtering happens in the browser on the loaded rows. */
export function filterPages<T extends ListRow>(items: T[], { category, location }: ListFilters): T[] {
  return items.filter((i) => {
    const c = classifyPath(i.path)
    return (category === 'all' || c.category === category) && (location === 'all' || c.location === location)
  })
}

/** The header line. Templates are not counted; numbers describe the rows actually shown. */
export function summarize(items: ListRow[], { filtered, truncated, limit }: { filtered: boolean; truncated: boolean; limit: number }): string {
  const real = items.filter((i) => !i.isTemplate)
  const published = real.filter((i) => i.status === 'published').length
  const drafts = real.filter((i) => i.status === 'draft').length
  const noun = real.length === 1 ? 'page' : 'pages'
  const base = `${real.length} ${filtered ? `matching ${noun}` : noun} · ${published} published · ${drafts} ${drafts === 1 ? 'draft' : 'drafts'}`
  // List adhuri ho to saaf batao, warna admin samjhega ki saare pages dikh rahe hain.
  return truncated ? `${base} · showing the ${limit} most recently changed; search to find others` : base
}
