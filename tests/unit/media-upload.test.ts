import { readFileSync } from 'node:fs'
import path from 'node:path'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SITE_IMAGE_MAX, sniffSiteImage } from '@/lib/requests/files'

const state = vi.hoisted(() => ({
  auth: {} as Record<string, unknown>,
  uploads: [] as { bucket: string; path: string; contentType: string }[],
  rows: [] as Record<string, unknown>[],
}))
vi.mock('@/lib/supabase/auth', () => ({ verifyAdminAuth: async () => state.auth }))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, _file: unknown, opts: { contentType: string }) => (state.uploads.push({ bucket, path, contentType: opts.contentType }), { error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.example/storage/v1/object/public/${bucket}/${path}` } }),
        remove: async () => ({ error: null }),
      }),
    },
    from: () => ({ insert: (row: Record<string, unknown>) => ({ select: () => ({ single: async () => (state.rows.push(row), { data: row, error: null }) }) }) }),
  }),
}))

import { POST } from '@/app/api/admin/media/route'

const ADMIN = { authenticated: true, authorized: true, user: { id: 'admin-1' }, role: 'super_admin' }
const pad = (head: number[], size = 64) => new Uint8Array([...head, ...Array(Math.max(0, size - head.length)).fill(0)])
const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const JPEG = pad([0xff, 0xd8, 0xff, 0xe0])
const GIF = pad([...new TextEncoder().encode('GIF89a')])
const WEBP = pad([...new TextEncoder().encode('RIFF'), 0, 0, 0, 0, ...new TextEncoder().encode('WEBP')])
const text = (s: string) => new TextEncoder().encode(s.padEnd(64, ' '))

function upload(bytes: Uint8Array, name: string, type: string, origin = 'http://localhost') {
  const form = new FormData()
  form.set('file', new File([bytes.slice().buffer as ArrayBuffer], name, { type }))
  form.set('alt_text', 'A water heater')
  return POST(new NextRequest('http://localhost/api/admin/media', { method: 'POST', body: form, headers: { origin } }))
}

beforeEach(() => {
  state.auth = { ...ADMIN }
  state.uploads = []
  state.rows = []
})

describe('site image detection', () => {
  it.each([['JPEG', JPEG, 'image/jpeg'], ['PNG', PNG, 'image/png'], ['GIF', GIF, 'image/gif'], ['WebP', WEBP, 'image/webp']])('recognises %s by its bytes', (_n, bytes, type) => {
    expect(sniffSiteImage(bytes)).toBe(type)
  })
  it('rejects HTML, SVG, executables, PDFs, videos, HEIC and tiny files', () => {
    expect(sniffSiteImage(text('<!doctype html><script>alert(1)</script>'))).toBeNull()
    expect(sniffSiteImage(text('<svg xmlns="http://www.w3.org/2000/svg" onload="x">'))).toBeNull()
    expect(sniffSiteImage(pad([0x4d, 0x5a, 0x90, 0x00]))).toBeNull()
    expect(sniffSiteImage(text('%PDF-1.7'))).toBeNull()
    const mp4 = pad([0, 0, 0, 0x18, ...new TextEncoder().encode('ftypisom')])
    expect(sniffSiteImage(mp4)).toBeNull()
    const heic = pad([0, 0, 0, 0x18, ...new TextEncoder().encode('ftypheic')])
    expect(sniffSiteImage(heic)).toBeNull()
    expect(sniffSiteImage(new Uint8Array([0xff, 0xd8, 0xff]))).toBeNull()
  })
})

describe('admin media upload', () => {
  it('stores a real image in the public site-media bucket with its true type', async () => {
    const res = await upload(PNG, 'Boiler Room.png', 'image/png')
    expect(res.status).toBe(201)
    expect(state.uploads).toHaveLength(1)
    expect(state.uploads[0]).toMatchObject({ bucket: 'site-media', contentType: 'image/png' })
    expect(state.uploads[0].path).toMatch(/^\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}-Boiler-Room\.png$/)
    expect(state.rows[0]).toMatchObject({ bucket: 'site-media', media_type: 'image/png', alt_text: 'A water heater' })
  })

  it('rejects an HTML page renamed to .jpg even when the browser says image/jpeg', async () => {
    const res = await upload(text('<html><body><script>steal()</script></body></html>'), 'photo.jpg', 'image/jpeg')
    expect(res.status).toBe(400)
    expect(state.uploads).toEqual([])
    expect(state.rows).toEqual([])
  })

  it('rejects an SVG or executable renamed as a PNG', async () => {
    expect((await upload(text('<svg onload="alert(1)">'), 'logo.png', 'image/png')).status).toBe(400)
    expect((await upload(pad([0x4d, 0x5a, 0x90, 0x00]), 'pic.png', 'image/png')).status).toBe(400)
    expect(state.uploads).toEqual([])
  })

  it('uses the real type and extension when the name and browser type are wrong', async () => {
    const res = await upload(JPEG, 'water-heater.png', 'image/png')
    expect(res.status).toBe(201)
    expect(state.uploads[0].contentType).toBe('image/jpeg')
    expect(state.uploads[0].path).toMatch(/-water-heater\.jpg$/)
  })

  it('refuses types outside the allowed list', async () => {
    expect((await upload(text('%PDF-1.7'), 'menu.pdf', 'application/pdf')).status).toBe(400)
    expect((await upload(text('<svg/>'), 'logo.svg', 'image/svg+xml')).status).toBe(400)
    expect(state.uploads).toEqual([])
  })

  it('accepts up to 4 MB, the most a Vercel function request can carry, and says so clearly above that', async () => {
    expect(SITE_IMAGE_MAX).toBe(4 * 1024 * 1024)
    const exact = new Uint8Array(SITE_IMAGE_MAX); exact.set(PNG)
    expect((await upload(exact, 'exact.png', 'image/png')).status).toBe(201)
    const over = new Uint8Array(SITE_IMAGE_MAX + 1); over.set(PNG)
    const res = await upload(over, 'big.png', 'image/png')
    expect(res.status).toBe(413)
    expect((await res.json()).error).toBe('Images can be up to 4 MB. Make this one smaller and try again.')
    expect(state.uploads).toHaveLength(1)
  })

  it('refuses an empty file', async () => {
    expect((await upload(new Uint8Array(0), 'empty.png', 'image/png')).status).toBe(400)
    expect(state.uploads).toEqual([])
  })

  it('shows the same limit in the admin screen as the server enforces', () => {
    const page = readFileSync(path.join(__dirname, '../../src/app/(admin)/admin/media/page.tsx'), 'utf8')
    expect(page).toContain('file.size > SITE_IMAGE_MAX')
    expect(page).toContain('up to {SITE_IMAGE_MAX_LABEL}')
    expect(page).not.toMatch(/10 ?MB/)
  })

  it('only accepts uploads from signed-in admins on this site', async () => {
    state.auth = { authenticated: false, authorized: false, user: null, role: null }
    expect((await upload(PNG, 'a.png', 'image/png')).status).toBe(401)
    state.auth = { authenticated: true, authorized: false, user: { id: 'u' }, role: 'customer' }
    expect((await upload(PNG, 'a.png', 'image/png')).status).toBe(403)
    state.auth = { ...ADMIN }
    expect((await upload(PNG, 'a.png', 'image/png', 'https://evil.example')).status).toBe(403)
    expect(state.uploads).toEqual([])
  })
})
