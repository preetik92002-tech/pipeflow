import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { failure, invalidInput, pageInputSchema, readJson, requireAdmin } from '@/lib/cms-pages/api'
import { createPage, listPages } from '@/lib/cms-pages/repository'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request, { mutating: false })
  if (admin instanceof NextResponse) return admin
  const params = request.nextUrl.searchParams
  const status = z.enum(['all', 'draft', 'published', 'unpublished']).catch('all').parse(params.get('status') ?? 'all')
  try {
    return NextResponse.json({ items: await listPages({ search: params.get('search') ?? '', status }) })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request, { mutating: true })
  if (admin instanceof NextResponse) return admin
  const parsed = pageInputSchema.extend({ isTemplate: z.boolean().default(false) }).safeParse(await readJson(request))
  if (!parsed.success) return invalidInput(parsed.error)
  try {
    const { isTemplate, ...input } = parsed.data
    const id = await createPage(input, admin.userId, isTemplate)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return failure(error)
  }
}
