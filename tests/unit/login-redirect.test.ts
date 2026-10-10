import { describe, it, expect } from 'vitest'
import { safeRedirect } from '@/lib/auth/redirect'
import { palette, contrastRatio } from '@/lib/design/tokens'

describe('safeRedirect', () => {
  it('allows admin and preview paths', () => {
    expect(safeRedirect('/admin/pages')).toBe('/admin/pages')
    expect(safeRedirect('/admin/pages?tab=1')).toBe('/admin/pages?tab=1')
    expect(safeRedirect('/preview/abc')).toBe('/preview/abc')
  })
  it('rejects external, protocol-relative and tricky values', () => {
    for (const bad of ['https://evil.com', '//evil.com', '/\evil.com', '/adminx', '/blog', 'javascript:alert(1)', '/admin/\n', '']) {
      expect(safeRedirect(bad)).toBe('/admin/dashboard')
    }
    expect(safeRedirect(null)).toBe('/admin/dashboard')
  })
})

describe('login palette contrast (WCAG AA)', () => {
  it('meets 4.5:1 for text pairs used on the login screen', () => {
    expect(contrastRatio(palette.ink, palette.white)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(palette.white, palette.terra)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(palette.error.text, palette.error.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio('#525252', palette.white)).toBeGreaterThanOrEqual(4.5) // neutral-600 placeholder
    expect(contrastRatio('#404040', palette.ivory)).toBeGreaterThanOrEqual(4.5) // neutral-700 helper text
  })
  it('input border meets 3:1 against white', () => {
    expect(contrastRatio(palette.field, palette.white)).toBeGreaterThanOrEqual(3)
  })
})
