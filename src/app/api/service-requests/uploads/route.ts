import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/forms/spamProtection'
import { ALLOWED_TYPES, maxSizeFor, safeFileName } from '@/lib/requests/files'
import { uploadRequestSchema } from '@/lib/requests/schema'

const BUCKET = 'service-requests'

/**
 * Step 1 of attaching photos: check the list of files the customer picked and hand back
 * short-lived signed upload URLs, so large files go straight to storage instead of
 * through this server. The files are checked again when the request is submitted.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = await checkRateLimit(`upload:${ip}`, 6, 600)
  if (!rate.allowed) return NextResponse.json({ error: 'Too many uploads. Please try again in a few minutes.' }, { status: 429 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = uploadRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Choose up to 6 files.' }, { status: 400 })

  for (const file of parsed.data.files) {
    if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json({ error: `${file.name}: only JPG, PNG, WebP, HEIC photos and MP4 or MOV videos can be attached.` }, { status: 400 })
    }
    if (file.size > maxSizeFor(file.type)) {
      return NextResponse.json({ error: `${file.name} is too large. Photos can be up to 10 MB and videos up to 50 MB.` }, { status: 400 })
    }
  }

  const group = randomUUID()
  const storage = createAdminClient().storage.from(BUCKET)
  try {
    const uploads = await Promise.all(
      parsed.data.files.map(async (file, i) => {
        const path = `${group}/${i}-${safeFileName(file.name)}`
        const { data, error } = await storage.createSignedUploadUrl(path)
        if (error || !data) throw new Error(error?.message ?? 'signed url failed')
        return { path, token: data.token, name: file.name, type: file.type }
      })
    )
    return NextResponse.json({ uploads })
  } catch (error) {
    console.error('[service-requests/uploads]', error)
    return NextResponse.json({ error: 'We could not start the upload. You can still send the request without photos.' }, { status: 503 })
  }
}
