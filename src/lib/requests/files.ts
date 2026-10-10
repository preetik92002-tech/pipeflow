/** What customers may attach to a request, and a check of the real file bytes (the browser's type is not trusted). */
export const IMAGE_MAX = 10 * 1024 * 1024
export const VIDEO_MAX = 50 * 1024 * 1024

export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime'] as const
export const isVideoType = (type: string) => type.startsWith('video/')
export const maxSizeFor = (type: string) => (isVideoType(type) ? VIDEO_MAX : IMAGE_MAX)

/** A storage-safe file name: lowercase letters, digits, dots, dashes. */
export function safeFileName(name: string): string {
  const cleaned = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9.]+/g, '-').replace(/-*\.-*/g, '.').replace(/^[-.]+|[-.]+$/g, '').replace(/\.{2,}/g, '.')
  const trimmed = cleaned.slice(-70)
  return trimmed.length > 0 ? trimmed : 'file'
}

const ascii = (b: Uint8Array, start: number, end: number) => String.fromCharCode(...b.slice(start, end))

/** The kind of file the first bytes describe, or null if it is not an allowed type. */
export function sniffType(bytes: Uint8Array): 'image' | 'video' | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image' // JPEG
  if (bytes[0] === 0x89 && ascii(bytes, 1, 4) === 'PNG') return 'image'
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'image'
  if (ascii(bytes, 4, 8) === 'ftyp') {
    const brand = ascii(bytes, 8, 12)
    if (['heic', 'heix', 'hevc', 'mif1', 'msf1', 'heim', 'heis'].includes(brand)) return 'image'
    return 'video' // mp4 / quicktime family
  }
  return null
}
