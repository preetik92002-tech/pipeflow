import { NextResponse, type NextRequest } from 'next/server'
import { failure, idSchema, requireAdmin } from '@/lib/cms-pages/api'
import { getRevisionContent, listRevisions } from '@/lib/cms-pages/repository'

type Ctx = { params: Promise<{ id: string }> }

/** Version history. With ?number=N, returns that version's content instead of the list. */
export async function GET(request: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin(request, { mutating: false })
  if (admin instanceof NextResponse) return admin
  const id = idSchema.safeParse((await params).id)
  if (!id.success) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  try {
    const n = request.nextUrl.searchParams.get('number')
    if (n !== null) {
      const number = Number(n)
      if (!Number.isInteger(number) || number < 1) return NextResponse.json({ error: 'Invalid version.' }, { status: 400 })
      const revision = await getRevisionContent(id.data, number)
      return revision ? NextResponse.json({ revision }) : NextResponse.json({ error: 'Version not found.' }, { status: 404 })
    }
    return NextResponse.json({ items: await listRevisions(id.data) })
  } catch (error) {
    return failure(error)
  }
}
