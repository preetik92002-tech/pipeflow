import { z } from 'zod'

/** First path segments that belong to the app itself, so no page may use them. */
export const RESERVED_SEGMENTS = [
  'admin',
  'api',
  '_next',
  'preview',
  'login',
  'sitemap.xml',
  'robots.txt',
  'favicon.ico',
  'manifest.webmanifest',
  'assets',
  'art',
  'blog',
  'book-service',
  'get-a-quote',
  'join-us',
] as const

const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const MAX_DEPTH = 4
export const MAX_PATH_LENGTH = 200

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Returns an error message, or null when the path is acceptable. '' is the homepage. */
export function validatePath(path: string, { allowHome = false } = {}): string | null {
  if (path === '') return allowHome ? null : 'Enter a URL.'
  if (path.length > MAX_PATH_LENGTH) return 'That URL is too long.'
  const segments = path.split('/')
  if (segments.length > MAX_DEPTH) return `Use at most ${MAX_DEPTH} levels, like plumbing/water-heater-repair.`
  if (!segments.every((s) => SEGMENT.test(s))) {
    return 'Use lowercase letters, numbers and single hyphens, with / between levels.'
  }
  if ((RESERVED_SEGMENTS as readonly string[]).includes(segments[0])) {
    return `"${segments[0]}" is reserved by the site and cannot be used.`
  }
  return null
}

export const pathSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^\/+|\/+$/g, ''))
  .superRefine((value, ctx) => {
    const error = validatePath(value, { allowHome: true })
    if (error) ctx.addIssue({ code: 'custom', message: error })
  })

/** '/hvac/ac-repair' for display and links; '/' for the homepage. */
export const pathToUrl = (path: string) => (path === '' ? '/' : `/${path}`)

/** Splits 'plumbing/water-heater-repair' into its parent folder and last segment. */
export function splitPath(path: string): { parent: string; slug: string } {
  const i = path.lastIndexOf('/')
  return i === -1 ? { parent: '', slug: path } : { parent: path.slice(0, i), slug: path.slice(i + 1) }
}
export const joinPath = (parent: string, slug: string) => (parent ? `${parent}/${slug}` : slug)
