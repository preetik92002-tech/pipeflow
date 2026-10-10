import { z } from 'zod'

/**
 * Where a button, link or image may point. Site paths and https/mailto/tel
 * only: this blocks javascript:, data: and protocol-relative (//host) URLs.
 */
export function isSafeHref(value: string): boolean {
  if (value.startsWith('/')) return !value.startsWith('//') && !value.includes('\\')
  try {
    const url = new URL(value)
    return ['https:', 'mailto:', 'tel:'].includes(url.protocol)
  } catch {
    return false
  }
}

export function isExternalHref(value: string): boolean {
  return /^https:/i.test(value)
}

export const hrefSchema = z
  .string()
  .trim()
  .min(1, 'Enter a link.')
  .max(2000)
  .refine(isSafeHref, 'Use a site path like /denver, or an https:, mailto: or tel: link.')

/** An image location: a site path or an https URL (never data: or javascript:). */
export const imageSrcSchema = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || (isSafeHref(v) && !/^(mailto|tel):/i.test(v)), 'Use a site path or an https image URL.')

export const buttonSchema = z.object({
  label: z.string().trim().min(1, 'Button text is required.').max(80),
  href: hrefSchema,
  variant: z.enum(['primary', 'secondary']).default('primary'),
})
export type CmsButton = z.infer<typeof buttonSchema>
