import { NextResponse, type NextRequest } from 'next/server'
import { failure, idSchema, invalidInput, invalidatePublicPaths, readJson, requireAdmin, versionSchema } from '@/lib/cms-pages/api'
import { getPageForAdmin, publishPage } from '@/lib/cms-pages/repository'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request, { mutating: true })
  if (admin instanceof NextResponse) return admin
  const id = idSchema.safeParse((await params).id)
  if (!id.success) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  const parsed = versionSchema.safeParse(await readJson(request))
  if (!parsed.success) return invalidInput(parsed.error)
  try {
    const page = await getPageForAdmin(id.data)
    const version = await publishPage(id.data, parsed.data.version, admin.userId)
    // Only after the database change has committed: make visitors see it now.
    invalidatePublicPaths(page?.path)
    return NextResponse.json({ version })
  } catch (error) {
    return failure(error)
  }
}
