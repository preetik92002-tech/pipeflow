// Login ke baad sirf andar ke admin/preview paths par bhejte hain (open-redirect se bachav).
const ALLOWED = /^\/(admin|preview)(\/|\?|#|$)/

export function safeRedirect(raw: string | null | undefined, fallback = '/admin/dashboard'): string {
  if (!raw || typeof raw !== 'string') return fallback
  if (raw.includes('\\') || raw.startsWith('//') || /[\u0000-\u001f]/.test(raw)) return fallback
  return ALLOWED.test(raw) ? raw : fallback
}
