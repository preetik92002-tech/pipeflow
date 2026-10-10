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

/** Public site images (Media Library): the formats every browser shows. */
export const SITE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export type SiteImageType = (typeof SITE_IMAGE_TYPES)[number]
// 4 MB: Vercel par function ki request body lagbhag 4.5 MB tak hi aati hai, aur ye upload
// server se hokar jaata hai. Isse bada limit likhna jhooth hota: badi file platform hi rok deta.
export const SITE_IMAGE_MAX = 4 * 1024 * 1024
export const SITE_IMAGE_MAX_LABEL = '4 MB'
export const SITE_IMAGE_EXT: Record<SiteImageType, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

/**
 * The real image type from the first bytes, or null. Browser ka bataya MIME type aur file ka
 * naam dono badle ja sakte hain (page.html ko photo.jpg rename karna), isliye public bucket mein
 * sirf wahi file jaati hai jiske bytes sach mein JPEG, PNG, WebP ya GIF hain. SVG jaan-bujhkar
 * allowed nahi: usmein script chal sakti hai.
 */
export function sniffSiteImage(bytes: Uint8Array): SiteImageType | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes[0] === 0x89 && ascii(bytes, 1, 8) === 'PNG\r\n\x1a\n') return 'image/png'
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'image/webp'
  if (ascii(bytes, 0, 6) === 'GIF87a' || ascii(bytes, 0, 6) === 'GIF89a') return 'image/gif'
  return null
}

const u16be = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1]
const u32be = (b: Uint8Array, i: number) => ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3]
const u32le = (b: Uint8Array, i: number) => b[i] + (b[i + 1] << 8) + (b[i + 2] << 16) + ((b[i + 3] << 24) >>> 0)

// End marker (IEND / EOI / RIFF size) hona zaroori hai: isse adhuri (truncated) file pakdi jaati hai.
// Marker ke baad extra bytes allowed hain kyunki kuch cameras/editors wahan data jodte hain;
// unmein HTML chhupa ho to neeche wala MARKUP scan use rokta hai.
function pngOk(b: Uint8Array): boolean {
  // Chunks: length, type, data, crc. Pehla IHDR (non-zero size), phir IEND tak saare chunks poore.
  let i = 8
  let first = true
  while (i + 12 <= b.length) {
    const len = u32be(b, i)
    const type = ascii(b, i + 4, i + 8)
    if (!/^[A-Za-z]{4}$/.test(type) || i + 12 + len > b.length) return false
    if (first && (type !== 'IHDR' || len !== 13 || u32be(b, i + 8) === 0 || u32be(b, i + 12) === 0)) return false
    first = false
    i += 12 + len
    if (type === 'IEND') return true
  }
  return false
}

function jpegOk(b: Uint8Array): boolean {
  // Markers SOS tak padho; frame header (SOF) mein size > 0 ho; SOS ke baad EOI (FFD9) maujood ho.
  let i = 2
  let sized = false
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return false
    const marker = b[i + 1]
    if (marker === 0xff) { i++; continue }
    const len = u16be(b, i + 2)
    if (len < 2 || i + 2 + len > b.length) return false
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      sized = len >= 8 && u16be(b, i + 5) > 0 && u16be(b, i + 7) > 0
    }
    if (marker === 0xda) {
      if (!sized) return false
      for (let j = i + 2 + len; j + 1 < b.length; j++) if (b[j] === 0xff && b[j + 1] === 0xd9) return true
      return false
    }
    i += 2 + len
  }
  return false
}

function gifOk(b: Uint8Array): boolean {
  // Logical screen size > 0 aur file trailer (0x3B) par khatam.
  return b.length >= 14 && (b[6] | (b[7] << 8)) > 0 && (b[8] | (b[9] << 8)) > 0 && b[b.length - 1] === 0x3b
}

function webpOk(b: Uint8Array): boolean {
  // RIFF header jitna size batata hai utni file poori ho, aur andar VP8/VP8L/VP8X chunk ho.
  return b.length >= 20 && u32le(b, 4) + 8 <= b.length && ['VP8 ', 'VP8L', 'VP8X'].includes(ascii(b, 12, 16))
}

// Browser in tags ko HTML/SVG ki tarah padh sakta hai; asli photo ke bytes mein ye kabhi nahi hote.
const MARKUP = ['<script', '<html', '<svg', '<iframe', '<!doctype', '<body', 'javascript:']

/**
 * Poori file check karta hai, sirf pehle bytes nahi: format ka structure (chunks/markers), size > 0,
 * aur file format ke end marker par hi khatam ho, taaki photo ke peeche HTML jodkar (polyglot) na
 * bheja ja sake. Ye pixel decode nahi karta: ek structurally sahi par corrupt image pass ho sakti hai,
 * lekin woh image type ke saath hi serve hoti hai, HTML ki tarah nahi.
 */
export function validateSiteImage(bytes: Uint8Array): { type: SiteImageType } | { error: string } {
  const type = sniffSiteImage(bytes)
  if (!type) return { error: 'This file is not a real JPEG, PNG, WebP or GIF image.' }
  const ok = { 'image/png': pngOk, 'image/jpeg': jpegOk, 'image/gif': gifOk, 'image/webp': webpOk }[type](bytes)
  if (!ok) return { error: 'This image file is damaged or incomplete. Export it again and retry.' }
  const text = new TextDecoder('latin1').decode(bytes).toLowerCase()
  if (MARKUP.some((m) => text.includes(m))) return { error: 'This image contains web page code and cannot be used.' }
  return { type }
}
