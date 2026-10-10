import { NextResponse, type NextRequest } from 'next/server'
import { failure, idSchema, requireAdmin } from '@/lib/cms-pages/api'
import { duplicatePage } from '@/lib/cms-pages/repository'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request, { mutating: true })
  if (admin instanceof NextResponse) return admin
  const id = idSchema.safeParse((await params).id)
  if (!id.success) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  try {
    return NextResponse.json({ id: await duplicatePage(id.data, admin.userId) }, { status: 201 })
  } catch (error) {
    return failure(error)
  }
}
