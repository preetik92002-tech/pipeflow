import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { sectionsSchema, type Section } from './sections/schema'
import { joinPath } from './paths'

/**
 * All CMS page data access. Server only: it uses the service role key, which
 * is why callers must run their own admin check first (the API routes do).
 * The tables have RLS enabled with no policies, so the public anon key cannot
 * read a draft even by calling Supabase directly.
 */

export type PageStatus = 'draft' | 'published' | 'unpublished'

export class CmsError extends Error {
  constructor(
    public code: 'not_found' | 'conflict' | 'path_taken' | 'invalid' | 'database',
    message: string
  ) {
    super(message)
  }
}

export interface PageContent {
  title: string
  description: string | null
  sections: unknown
  seoTitle: string | null
  seoDescription: string | null
  ogImage: string | null
  canonicalUrl: string | null
  noindex: boolean
}

export interface PublicPage extends PageContent {
  id: string
  path: string
  publishedAt: string | null
}

export interface AdminPage extends PageContent {
  id: string
  path: string
  status: PageStatus
  version: number
  isTemplate: boolean
  hasUnpublishedChanges: boolean
  updatedAt: string
  publishedAt: string | null
  publishedPath: string | null
}

export interface PageListItem {
  id: string
  title: string
  path: string
  status: PageStatus
  isTemplate: boolean
  hasUnpublishedChanges: boolean
  updatedAt: string
  publishedAt: string | null
}

interface RevisionRow {
  id: string
  number: number
  title: string
  description: string | null
  sections: unknown
  seo_title: string | null
  seo_description: string | null
  og_image: string | null
  canonical_url: string | null
  noindex: boolean
}

const REVISION_COLUMNS = 'id,number,title,description,sections,seo_title,seo_description,og_image,canonical_url,noindex'

const content = (r: RevisionRow): PageContent => ({
  title: r.title,
  description: r.description,
  sections: r.sections,
  seoTitle: r.seo_title,
  seoDescription: r.seo_description,
  ogImage: r.og_image,
  canonicalUrl: r.canonical_url,
  noindex: r.noindex,
})

interface RpcError {
  code?: string
  message: string
}

/** Turns a Postgres error from one of our functions into something the API can answer with. */
export function toCmsError(error: RpcError): CmsError {
  if (error.message.includes('version_conflict') || error.code === '40001') {
    return new CmsError('conflict', 'This page was changed by someone else. Reload to see their changes.')
  }
  if (error.code === '23505') return new CmsError('path_taken', 'Another page already uses that URL.')
  if (error.message.includes('page_not_found') || error.code === 'P0002') return new CmsError('not_found', 'Page not found.')
  if (error.message.includes('template_not_publishable')) return new CmsError('invalid', 'Template pages cannot be published. Duplicate it first.')
  if (error.code === '23514') return new CmsError('invalid', 'That URL or title is not allowed.')
  return new CmsError('database', error.message)
}

// ---------------------------------------------------------------- public reads

/** The live version of a page, or null if it is missing, a draft, unpublished or deleted. */
export async function getPublishedPage(path: string): Promise<PublicPage | null> {
  const db = createAdminClient()
  const { data: page, error } = await db
    .from('cms_pages')
    .select('id,path,published_at,published_revision_id')
    .eq('path', path)
    .eq('status', 'published')
    .eq('is_template', false)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw new Error(`Unable to load page: ${error.message}`)
  if (!page?.published_revision_id) return null
  const { data: rev, error: revError } = await db
    .from('cms_page_revisions')
    .select(REVISION_COLUMNS)
    .eq('id', page.published_revision_id)
    .single()
  if (revError) throw new Error(`Unable to load page content: ${revError.message}`)
  return { id: page.id, path: page.path, publishedAt: page.published_at, ...content(rev as RevisionRow) }
}

export async function getRedirect(path: string): Promise<{ to: string; permanent: boolean } | null> {
  const db = createAdminClient()
  const { data, error } = await db.from('cms_redirects').select('to_path,status_code').eq('from_path', path).maybeSingle()
  if (error) throw new Error(`Unable to load redirect: ${error.message}`)
  return data ? { to: data.to_path, permanent: true } : null
}

export async function listPublishedPaths(): Promise<{ path: string; updatedAt: string; noindex: boolean }[]> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('cms_pages')
    .select('path,updated_at,published_revision_id')
    .eq('status', 'published')
    .eq('is_template', false)
    .is('deleted_at', null)
  if (error) throw new Error(`Unable to list pages: ${error.message}`)
  const ids = (data ?? []).map((p) => p.published_revision_id).filter(Boolean) as string[]
  const noindexIds = new Set<string>()
  if (ids.length) {
    const { data: revs, error: revError } = await db.from('cms_page_revisions').select('id,noindex').in('id', ids)
    if (revError) throw new Error(`Unable to list pages: ${revError.message}`)
    revs?.forEach((r) => r.noindex && noindexIds.add(r.id))
  }
  return (data ?? []).map((p) => ({ path: p.path, updatedAt: p.updated_at, noindex: noindexIds.has(p.published_revision_id) }))
}

// ----------------------------------------------------------------- admin reads

export async function listPages(opts: { search?: string; status?: PageStatus | 'all' } = {}): Promise<PageListItem[]> {
  const db = createAdminClient()
  let q = db
    .from('cms_pages')
    .select('id,title,path,status,is_template,draft_revision_id,published_revision_id,updated_at,published_at')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(500)
  if (opts.status && opts.status !== 'all') q = q.eq('status', opts.status)
  if (opts.search?.trim()) {
    // Strip characters that have meaning in PostgREST filters before using the text.
    const term = opts.search.trim().replace(/[%,()*\\]/g, ' ').slice(0, 80)
    q = q.or(`title.ilike.%${term}%,path.ilike.%${term}%`)
  }
  const { data, error } = await q
  if (error) throw new CmsError('database', error.message)
  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    path: p.path,
    status: p.status as PageStatus,
    isTemplate: p.is_template,
    hasUnpublishedChanges: p.status === 'published' && p.draft_revision_id !== p.published_revision_id,
    updatedAt: p.updated_at,
    publishedAt: p.published_at,
  }))
}

export async function getPageStats() {
  const db = createAdminClient()
  const { data, error } = await db.from('cms_pages').select('status,is_template').is('deleted_at', null)
  if (error) throw new CmsError('database', error.message)
  const pages = (data ?? []).filter((p) => !p.is_template)
  return {
    total: pages.length,
    published: pages.filter((p) => p.status === 'published').length,
    draft: pages.filter((p) => p.status === 'draft').length,
    unpublished: pages.filter((p) => p.status === 'unpublished').length,
  }
}

export async function getPageForAdmin(id: string): Promise<AdminPage | null> {
  const db = createAdminClient()
  const { data: page, error } = await db.from('cms_pages').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
  if (error) throw new CmsError('database', error.message)
  if (!page) return null
  const { data: rev, error: revError } = await db.from('cms_page_revisions').select(REVISION_COLUMNS).eq('id', page.draft_revision_id).single()
  if (revError) throw new CmsError('database', revError.message)
  return {
    id: page.id,
    path: page.path,
    status: page.status as PageStatus,
    version: page.version,
    isTemplate: page.is_template,
    hasUnpublishedChanges: page.status === 'published' && page.draft_revision_id !== page.published_revision_id,
    updatedAt: page.updated_at,
    publishedAt: page.published_at,
    publishedPath: page.published_at ? page.path : null,
    ...content(rev as RevisionRow),
  }
}

// ---------------------------------------------------------------------- writes

export interface PageInput {
  title: string
  path: string
  description: string | null
  sections: Section[]
  seoTitle: string | null
  seoDescription: string | null
  ogImage: string | null
  canonicalUrl: string | null
  noindex: boolean
}

export async function createPage(input: PageInput, userId: string | null, isTemplate = false): Promise<string> {
  const { data, error } = await createAdminClient().rpc('cms_create_page', {
    p_title: input.title,
    p_path: input.path,
    p_description: input.description,
    p_sections: input.sections,
    p_seo_title: input.seoTitle,
    p_seo_description: input.seoDescription,
    p_og_image: input.ogImage,
    p_canonical_url: input.canonicalUrl,
    p_noindex: input.noindex,
    p_is_template: isTemplate,
    p_user: userId,
  })
  if (error) throw toCmsError(error)
  return data as string
}

/** Returns the page's new version. */
export async function saveDraft(id: string, expectedVersion: number, input: PageInput, userId: string | null): Promise<number> {
  const { data, error } = await createAdminClient().rpc('cms_save_draft', {
    p_page_id: id,
    p_expected_version: expectedVersion,
    p_title: input.title,
    p_path: input.path,
    p_description: input.description,
    p_sections: input.sections,
    p_seo_title: input.seoTitle,
    p_seo_description: input.seoDescription,
    p_og_image: input.ogImage,
    p_canonical_url: input.canonicalUrl,
    p_noindex: input.noindex,
    p_user: userId,
  })
  if (error) throw toCmsError(error)
  return data as number
}

export async function publishPage(id: string, expectedVersion: number, userId: string | null): Promise<number> {
  const { data, error } = await createAdminClient().rpc('cms_publish', { p_page_id: id, p_expected_version: expectedVersion, p_user: userId })
  if (error) throw toCmsError(error)
  return data as number
}

export async function unpublishPage(id: string, expectedVersion: number, userId: string | null): Promise<number> {
  const { data, error } = await createAdminClient().rpc('cms_unpublish', { p_page_id: id, p_expected_version: expectedVersion, p_user: userId })
  if (error) throw toCmsError(error)
  return data as number
}

export async function deletePage(id: string, userId: string | null): Promise<void> {
  const { error } = await createAdminClient().rpc('cms_delete_page', { p_page_id: id, p_user: userId })
  if (error) throw toCmsError(error)
}

/**
 * Duplicate a page as a new draft: same sections in the same order with the
 * same layout, new section ids. The URL gets a free "-copy" suffix, the title
 * "Copy of ...", and the SEO fields are cleared so two pages never ship with
 * the same title by accident. Images are shared, not copied.
 */
export async function duplicatePage(id: string, userId: string | null): Promise<string> {
  const source = await getPageForAdmin(id)
  if (!source) throw new CmsError('not_found', 'Page not found.')
  const parsed = sectionsSchema.safeParse(source.sections)
  const sections = (parsed.success ? parsed.data : []).map((s) => ({ ...s, id: crypto.randomUUID() })) as Section[]
  const db = createAdminClient()
  const { data: taken } = await db.from('cms_pages').select('path').is('deleted_at', null).like('path', `${source.path}-copy%`)
  const used = new Set((taken ?? []).map((r) => r.path))
  let path = `${source.path}-copy`
  for (let n = 2; used.has(path); n++) path = `${source.path}-copy-${n}`
  if (source.path === '') path = joinPath('', `home-copy-${Date.now().toString(36)}`)
  return createPage(
    {
      title: `Copy of ${source.title}`.slice(0, 180),
      path,
      description: source.description,
      sections,
      seoTitle: null,
      seoDescription: null,
      ogImage: null,
      canonicalUrl: null,
      noindex: false,
    },
    userId
  )
}
