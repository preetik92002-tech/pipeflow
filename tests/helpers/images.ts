/** Tiny, structurally valid image files for upload tests (pixel data is not meaningful). */
const enc = (s: string) => [...new TextEncoder().encode(s)]
const be32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
const le32 = (n: number) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]
const chunk = (type: string, data: number[] | Uint8Array) => [...be32(data.length), ...enc(type), ...data, 0, 0, 0, 0]

/** A PNG of the given total byte size (at least 57), padded inside its IDAT chunk. */
export function png({ size = 0, width = 1, height = 1 } = {}): Uint8Array {
  const head = [0x89, ...enc('PNG\r\n\x1a\n'), ...chunk('IHDR', [...be32(width), ...be32(height), 8, 0, 0, 0, 0])]
  const end = chunk('IEND', [])
  const idatLen = Math.max(1, size - head.length - end.length - 12)
  const out = new Uint8Array(head.length + 12 + idatLen + end.length)
  out.set(head, 0)
  out.set([...be32(idatLen), ...enc('IDAT')], head.length)
  out.set(end, head.length + 12 + idatLen)
  return out
}

export function jpeg({ comment = '', width = 1, height = 1 } = {}): Uint8Array {
  const com = comment ? [0xff, 0xfe, ...[(enc(comment).length + 2) >> 8, (enc(comment).length + 2) & 255], ...enc(comment)] : []
  return new Uint8Array([
    0xff, 0xd8,
    0xff, 0xe0, 0, 16, ...enc('JFIF'), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0,
    ...com,
    0xff, 0xc0, 0, 11, 8, height >> 8, height & 255, width >> 8, width & 255, 1, 1, 0x11, 0,
    0xff, 0xda, 0, 8, 1, 1, 0, 0, 63, 0,
    0x12, 0x34, 0x56,
    0xff, 0xd9,
  ])
}

export function gif({ width = 1 } = {}): Uint8Array {
  return new Uint8Array([...enc('GIF89a'), width, 0, 1, 0, 0, 0, 0, 0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 0x44, 0x01, 0, 0x3b])
}

export function webp(): Uint8Array {
  const vp8l = [...enc('VP8L'), ...le32(5), 0x2f, 0, 0, 0, 0, 0]
  const body = [...enc('WEBP'), ...vp8l]
  return new Uint8Array([...enc('RIFF'), ...le32(body.length), ...body])
}

export const concat = (...parts: (Uint8Array | number[])[]) => new Uint8Array(parts.flatMap((p) => [...p]))
export const ascii = (s: string) => new TextEncoder().encode(s)
