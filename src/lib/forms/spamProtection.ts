/**
 * Form security and anti-spam utility
 */

interface SpamCheckOptions {
  honeypotValue?: string | null
  submittedAt?: string | null
  minimumSeconds?: number
}

// In-memory rate limiting store (IP -> timestamps array)
const rateLimitStore = new Map<string, number[]>()

export function checkSpam(options: SpamCheckOptions): { isSpam: boolean; reason?: string } {
  const { honeypotValue, submittedAt, minimumSeconds = 2.0 } = options

  // 1. Honeypot check: If the hidden honeypot field has any value, it's a bot
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return { isSpam: true, reason: 'Honeypot field triggered' }
  }

  // 2. Timestamp check: If form completed impossibly fast (under 2 seconds)
  if (submittedAt) {
    const submitTime = new Date(submittedAt).getTime()
    const now = Date.now()
    const diffSeconds = (now - submitTime) / 1000

    // If client timestamp is in the future or under minimumSeconds
    if (diffSeconds < minimumSeconds && diffSeconds >= 0) {
      return { isSpam: true, reason: 'Form completed too quickly (bot activity)' }
    }
  }

  return { isSpam: false }
}

export function checkRateLimit(
  clientIdentifier: string,
  maxRequests = 10,
  windowSeconds = 60
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const timestamps = rateLimitStore.get(clientIdentifier) || []

  // Clean old timestamps outside the window
  const validTimestamps = timestamps.filter((t) => now - t < windowMs)

  if (validTimestamps.length >= maxRequests) {
    const oldest = validTimestamps[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    return { allowed: false, retryAfter }
  }

  validTimestamps.push(now)
  rateLimitStore.set(clientIdentifier, validTimestamps)
  return { allowed: true }
}

export function sanitizeString(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip inline JS protocols
    .replace(/onload|onerror|onclick/gi, '') // Strip event handlers
    .trim()
}
