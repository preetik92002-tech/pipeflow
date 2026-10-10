import { NextResponse, type NextRequest } from 'next/server'
import { failure, idSchema, invalidInput, invalidatePublicPaths, readJson, requireAdmin, versionSchema } from '@/lib/cms-pages/api'
import { publishProblems } from '@/lib/cms-pages/publish-checks'
import { CmsError, getPageForAdmin, listLivePagesForChecks, publishPage } from '@/lib/cms-pages/repository'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request, { mutating: true })
  if (admin instanceof NextResponse) return admin
  const id = idSchema.safeParse((await params).id)
  if (!id.success) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  const parsed = versionSchema.safeParse(await readJson(request))
  if (!parsed.success) return invalidInput(parsed.error)
  try {
    const page = await getPageForAdmin(id.data)
    if (!page) throw new CmsError('not_found', 'Page not found.')
    // Jo version check hua wahi publish ho: beech mein kisi ne draft badla to version
    // match nahi karega aur publish conflict ke saath ruk jayega.
    if (page.version !== parsed.data.version) {
      throw new CmsError('conflict', 'This page was changed by someone else. Reload to see their changes.')
    }
    const problems = publishProblems(page, await listLivePagesForChecks())
    if (problems.length) {
      return NextResponse.json({ error: problems[0], code: 'invalid', issues: problems.map((message) => ({ path: 'publish', message })) }, { status: 400 })
    }
    const version = await publishPage(id.data, parsed.data.version, admin.userId)
    // Only after the database change has committed: make visitors see it now.
    invalidatePublicPaths(page.path)
    return NextResponse.json({ version })
  } catch (error) {
    return failure(error)
  }
}
