import { describe, expect, it } from 'vitest'
import { ATTACHMENT_PATH, requestSchema, serviceLabel } from '@/lib/requests/schema'
import { safeFileName, sniffType } from '@/lib/requests/files'

const valid = {
  customerType: 'homeowner', category: 'plumbing', service: 'water-heater-repair',
  description: 'The water heater is leaking from the bottom.', urgency: 'today', city: 'Denver',
  address: '123 Example St', zip: '80202', name: 'Sam Example', phone: '(303) 555-0100', email: 'sam@example.com',
}

describe('service request schema', () => {
  it('accepts a complete homeowner request', () => {
    expect(requestSchema.safeParse(valid).success).toBe(true)
  })

  it('requires the business name for business requests', () => {
    expect(requestSchema.safeParse({ ...valid, customerType: 'business' }).success).toBe(false)
    expect(requestSchema.safeParse({ ...valid, customerType: 'business', business: { name: 'Acme Co' } }).success).toBe(true)
  })

  it('rejects a service that does not belong to the chosen category', () => {
    expect(requestSchema.safeParse({ ...valid, service: 'ac-repair' }).success).toBe(false)
    expect(requestSchema.safeParse({ ...valid, category: 'hvac', service: 'ac-repair' }).success).toBe(true)
  })

  it('only takes Denver or Boulder and Colorado ZIP codes', () => {
    expect(requestSchema.safeParse({ ...valid, city: 'Seattle' }).success).toBe(false)
    expect(requestSchema.safeParse({ ...valid, zip: '98101' }).success).toBe(false)
    expect(requestSchema.safeParse({ ...valid, zip: '8020' }).success).toBe(false)
    expect(requestSchema.safeParse({ ...valid, city: 'Boulder', zip: '80301' }).success).toBe(true)
  })

  it('needs a real phone, email and description', () => {
    expect(requestSchema.safeParse({ ...valid, phone: 'abc' }).success).toBe(false)
    expect(requestSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
    expect(requestSchema.safeParse({ ...valid, description: 'short' }).success).toBe(false)
  })

  it('only accepts attachment paths made by the upload step', () => {
    const ok = '0b9f7a3e-1c2d-4e5f-8a9b-0c1d2e3f4a5b/0-leak.jpg'
    expect(ATTACHMENT_PATH.test(ok)).toBe(true)
    for (const bad of ['../etc/passwd', 'other-bucket/0-a.jpg', `${ok}/../x`, '0b9f7a3e-1c2d-4e5f-8a9b-0c1d2e3f4a5b/9-a.jpg', '/abs/0-a.jpg']) {
      expect(ATTACHMENT_PATH.test(bad), bad).toBe(false)
    }
    expect(requestSchema.safeParse({ ...valid, attachments: ['x'] }).success).toBe(false)
    expect(requestSchema.safeParse({ ...valid, attachments: Array(7).fill(ok) }).success).toBe(false)
  })

  it('labels services', () => {
    expect(serviceLabel('frozen-pipe-repair')).toBe('Frozen Pipe Repair')
  })
})

describe('attachment files', () => {
  const bytes = (...b: number[]) => new Uint8Array([...b, ...Array(16).fill(0)].slice(0, 16))
  it('recognises allowed file types by their bytes', () => {
    expect(sniffType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('image')
    expect(sniffType(bytes(0x89, 0x50, 0x4e, 0x47))).toBe('image')
    const mp4 = new Uint8Array(16); mp4.set([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d])
    expect(sniffType(mp4)).toBe('video')
    const heic = new Uint8Array(16); heic.set([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63])
    expect(sniffType(heic)).toBe('image')
  })

  it('rejects scripts, HTML and executables renamed as photos', () => {
    const enc = (s: string) => new TextEncoder().encode(s.padEnd(16, ' '))
    expect(sniffType(enc('<html><script>'))).toBeNull()
    expect(sniffType(enc('<svg xmlns=...'))).toBeNull()
    expect(sniffType(bytes(0x4d, 0x5a, 0x90, 0x00))).toBeNull() // Windows executable
    expect(sniffType(new Uint8Array(4))).toBeNull()
  })

  it('makes storage-safe file names', () => {
    expect(safeFileName('My Photo (1).JPG')).toBe('my-photo-1.jpg')
    expect(safeFileName('../../etc/passwd')).not.toContain('/')
    expect(safeFileName('???')).toBe('file')
  })
})
