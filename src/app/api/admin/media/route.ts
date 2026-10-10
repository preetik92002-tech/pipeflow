import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminAuth } from '@/lib/supabase/auth'
import { SITE_IMAGE_EXT, SITE_IMAGE_MAX, SITE_IMAGE_MAX_LABEL, SITE_IMAGE_TYPES, validateSiteImage } from '@/lib/requests/files'

const allowedTypes = new Set<string>(SITE_IMAGE_TYPES)

async function requireAdmin() {
  const auth = await verifyAdminAuth()
  return auth.authorized ? null : NextResponse.json({ error: auth.authenticated ? 'Admin authorization required.' : 'Sign in required.' }, { status: auth.authenticated ? 403 : 401 })
}

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.from('media').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ items: data ?? [] })
  } catch (error) {
    console.error('[admin/media] list failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Unable to load media.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  // Dusri site se aaya form upload nahi kar sakta (admin ki login cookie ka galat use).
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 })
  const auth = await verifyAdminAuth()
  if (!auth.authorized) return NextResponse.json({ error: auth.authenticated ? 'Admin authorization required.' : 'Sign in required.' }, { status: auth.authenticated ? 403 : 401 })
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Choose an image file to upload.' }, { status: 400 })
  }
  const file = form.get('file')
  const altText = form.get('alt_text')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image file to upload.' }, { status: 400 })
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: 'Upload a JPEG, PNG, WebP, or GIF image.' }, { status: 400 })
  if (file.size < 1) return NextResponse.json({ error: 'This file is empty.' }, { status: 400 })
  if (file.size > SITE_IMAGE_MAX) return NextResponse.json({ error: `Images can be up to ${SITE_IMAGE_MAX_LABEL}. Make this one smaller and try again.` }, { status: 413 })
  // Poori file check hoti hai (structure, end marker, andar chhupa HTML): browser ka type sirf pehla filter hai.
  // Jo bytes check hue, wahi upload hote hain, taaki check aur stored content alag na ho sakein.
  const bytes = new Uint8Array(await file.arrayBuffer())
  const checked = validateSiteImage(bytes)
  if ('error' in checked) return NextResponse.json({ error: checked.error }, { status: 400 })
  const kind = checked.type
  // Extension bhi asli type ka, taaki storage mein "photo.html" jaisa naam na bane.
  const base = file.name.replace(/\.[^.]*$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(-100) || 'image'
  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${base}.${SITE_IMAGE_EXT[kind]}`
  const admin = createAdminClient()
  // Ye route sirf public 'site-media' bucket mein likhta hai. Customer ki private photos
  // 'service-requests' bucket mein alag rehti hain aur yahan se kabhi nahi chhuti.
  const { error: uploadError } = await admin.storage.from('site-media').upload(path, bytes, { contentType: kind, upsert: false })
  if (uploadError) {
    // Storage ka andar ka error sirf server log mein; admin ko saaf, generic message.
    console.error('[admin/media] upload failed', uploadError.message)
    return NextResponse.json({ error: 'The image could not be stored. Please try again.' }, { status: 503 })
  }
  const url = admin.storage.from('site-media').getPublicUrl(path).data.publicUrl
  const { data, error } = await admin.from('media').insert({ filename: file.name.slice(0, 250), url, bucket: 'site-media', alt_text: typeof altText === 'string' ? altText.slice(0, 250) : null, media_type: kind, size_bytes: bytes.length, uploaded_by: auth.user?.id || null }).select('*').single()
  if (error) {
    await admin.storage.from('site-media').remove([path])
    console.error('[admin/media] media record failed', error.message)
    return NextResponse.json({ error: 'The image could not be saved. Please try again.' }, { status: 503 })
  }
  return NextResponse.json({ item: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Media record ID is required.' }, { status: 400 })
  const admin = createAdminClient()
  const { data: media, error: fetchError } = await admin.from('media').select('id,bucket,url').eq('id', id).maybeSingle()
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 503 })
  if (!media) return NextResponse.json({ error: 'Media record was not found.' }, { status: 404 })
  if (media.bucket !== 'site-media') return NextResponse.json({ error: 'This media item is not stored in a managed public bucket.' }, { status: 400 })
  const marker = '/storage/v1/object/public/site-media/'
  const objectPath = media.url.split(marker)[1]
  if (!objectPath) return NextResponse.json({ error: 'The media URL does not match its configured bucket.' }, { status: 409 })
  const references = await Promise.all([
    admin.from('blogs').select('id').eq('featured_image', media.url).limit(1),
    admin.from('services').select('id').eq('image_url', media.url).limit(1),
    admin.from('service_areas').select('id').eq('hero_image', media.url).limit(1),
    admin.from('testimonials').select('id').eq('image_url', media.url).limit(1),
    admin.from('homepage_content').select('id,content').eq('id', 'home').maybeSingle(),
  ])
  const referenceError = references.find((result) => result.error)?.error
  if (referenceError) return NextResponse.json({ error: `Unable to check media references: ${referenceError.message}` }, { status: 503 })
  const referenced = references.slice(0, 4).some((result) => Array.isArray(result.data) && result.data.length > 0)
    || JSON.stringify(references[4].data?.content ?? {}).includes(media.url)
  if (referenced) return NextResponse.json({ error: 'This image is in use by website content. Replace that content image before deleting it.' }, { status: 409 })
  const { error: storageError } = await admin.storage.from('site-media').remove([decodeURIComponent(objectPath)])
  if (storageError) return NextResponse.json({ error: `Unable to remove stored image: ${storageError.message}` }, { status: 503 })
  const { error } = await admin.from('media').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 503 })
  return NextResponse.json({ success: true })
}
