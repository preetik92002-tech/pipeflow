import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { invalidInput, readJson, requireAdmin } from '@/lib/cms-pages/api'
import { getNavigation, saveNavigation } from '@/lib/cms-pages/navigation'
import { navigationSchema } from '@/lib/cms-pages/navigation-schema'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request, { mutating: false })
  if (admin instanceof NextResponse) return admin
  return NextResponse.json({ navigation: await getNavigation() })
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request, { mutating: true })
  if (admin instanceof NextResponse) return admin
  const parsed = navigationSchema.safeParse(await readJson(request))
  if (!parsed.success) return invalidInput(parsed.error)
  try {
    await saveNavigation(parsed.data)
  } catch {
    return NextResponse.json({ error: 'Unable to save navigation. Please try again.' }, { status: 503 })
  }
  revalidatePath('/', 'layout')
  return NextResponse.json({ navigation: parsed.data })
}
