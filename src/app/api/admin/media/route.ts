import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminAuth } from '@/lib/supabase/auth'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

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
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load media.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth()
  if (!auth.authorized) return NextResponse.json({ error: auth.authenticated ? 'Admin authorization required.' : 'Sign in required.' }, { status: auth.authenticated ? 403 : 401 })
  const form = await request.formData()
  const file = form.get('file')
  const altText = form.get('alt_text')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image file to upload.' }, { status: 400 })
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: 'Upload a JPEG, PNG, WebP, or GIF image.' }, { status: 400 })
  if (file.size < 1 || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Image size must be less than 10 MB.' }, { status: 400 })
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120)
  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`
  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage.from('site-media').upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 503 })
  const url = admin.storage.from('site-media').getPublicUrl(path).data.publicUrl
  const { data, error } = await admin.from('media').insert({ filename: file.name, url, bucket: 'site-media', alt_text: typeof altText === 'string' ? altText.slice(0, 250) : null, media_type: file.type, size_bytes: file.size, uploaded_by: auth.user?.id || null }).select('*').single()
  if (error) {
    await admin.storage.from('site-media').remove([path])
    return NextResponse.json({ error: `Unable to save media record: ${error.message}` }, { status: 503 })
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
