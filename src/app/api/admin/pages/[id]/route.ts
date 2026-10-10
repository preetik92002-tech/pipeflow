import { NextResponse, type NextRequest } from 'next/server'
import { failure, idSchema, invalidInput, invalidatePublicPaths, readJson, requireAdmin, saveSchema } from '@/lib/cms-pages/api'
import { deletePage, getPageForAdmin, saveDraft } from '@/lib/cms-pages/repository'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin(request, { mutating: false })
  if (admin instanceof NextResponse) return admin
  const id = idSchema.safeParse((await params).id)
  if (!id.success) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  try {
    const page = await getPageForAdmin(id.data)
    return page ? NextResponse.json({ page }) : NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  } catch (error) {
    return failure(error)
  }
}

/** Saves a new draft. The live page does not change until it is published. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin(request, { mutating: true })
  if (admin instanceof NextResponse) return admin
  const id = idSchema.safeParse((await params).id)
  if (!id.success) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  const parsed = saveSchema.safeParse(await readJson(request))
  if (!parsed.success) return invalidInput(parsed.error)
  try {
    const before = await getPageForAdmin(id.data)
    const { version, ...input } = parsed.data
    const next = await saveDraft(id.data, version, input, admin.userId)
    // A URL change takes effect at once for a page that has been published, so
    // refresh the old URL (now a redirect) and the new one. Drafts change nothing public.
    if (before?.publishedPath !== null && before && before.path !== input.path) {
      invalidatePublicPaths(before.path, input.path)
    }
    return NextResponse.json({ version: next })
  } catch (error) {
    return failure(error)
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin(request, { mutating: true })
  if (admin instanceof NextResponse) return admin
  const id = idSchema.safeParse((await params).id)
  if (!id.success) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  try {
    const page = await getPageForAdmin(id.data)
    await deletePage(id.data, admin.userId)
    invalidatePublicPaths(page?.path)
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error)
  }
}
