import 'server-only'
import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { CmsError } from './repository'
import { pathSchema, pathToUrl } from './paths'
import { sectionsSchema } from './sections/schema'
import { hrefSchema, imageSrcSchema } from './links'

/**
 * Checks, in order: the caller is signed in as an admin (server-side, every
 * request), and for anything that changes data, that the request came from
 * this site. Returns the admin's user id, or a ready-made error response.
 */
export async function requireAdmin(request: NextRequest, { mutating }: { mutating: boolean }): Promise<{ userId: string } | NextResponse> {
  if (mutating) {
    const origin = request.headers.get('origin')
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 })
    }
  }
  const auth = await verifyAdminAuth()
  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: auth.authenticated ? 'Admin authorization required.' : 'Sign in required.' },
      { status: auth.authenticated ? 403 : 401 }
    )
  }
  return { userId: auth.user.id }
}

export function failure(error: unknown) {
  if (error instanceof CmsError) {
    const status = { not_found: 404, conflict: 409, path_taken: 409, invalid: 400, database: 503 }[error.code]
    return NextResponse.json({ error: error.message, code: error.code }, { status })
  }
  console.error('[cms-pages]', error)
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
}

export function invalidInput(error: z.ZodError) {
  const issues = error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
  return NextResponse.json({ error: issues[0]?.message ?? 'Invalid content.', code: 'invalid', issues }, { status: 400 })
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform((v) => (v ? v : null))

export const pageInputSchema = z.object({
  title: z.string().trim().min(1, 'A title is required.').max(180),
  path: pathSchema,
  description: optionalText(320),
  sections: sectionsSchema.default([]),
  seoTitle: optionalText(180),
  seoDescription: optionalText(320),
  ogImage: imageSrcSchema.nullish().transform((v) => (v ? v : null)),
  canonicalUrl: hrefSchema.refine((v) => v.startsWith('https://'), 'Use a full https:// address.').nullish().or(z.literal('')).transform((v) => (v ? v : null)),
  noindex: z.boolean().default(false),
})

export const saveSchema = pageInputSchema.extend({ version: z.number().int().min(1) })
export const versionSchema = z.object({ version: z.number().int().min(1) })
export const idSchema = z.string().uuid()

/**
 * Makes the live site pick up a change right away. Call only after the
 * database write succeeded. Pass every path whose public output changed
 * (for a move, both the old and the new one).
 */
export function invalidatePublicPaths(...paths: (string | null | undefined)[]) {
  for (const path of new Set(paths)) {
    if (path === null || path === undefined) continue
    revalidatePath(pathToUrl(path))
  }
  revalidatePath('/sitemap.xml')
}
