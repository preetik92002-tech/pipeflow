/**
 * Form security and anti-spam utility
 */

import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

interface SpamCheckOptions {
  honeypotValue?: string | null
  submittedAt?: string | null
  minimumSeconds?: number
}

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
    if (!Number.isFinite(submitTime) || submitTime > now + 5000) {
      return { isSpam: true, reason: 'Invalid form timestamp' }
    }
    const diffSeconds = (now - submitTime) / 1000

    // If client timestamp is in the future or under minimumSeconds
    if (diffSeconds < minimumSeconds && diffSeconds >= 0) {
      return { isSpam: true, reason: 'Form completed too quickly (bot activity)' }
    }
  }

  return { isSpam: false }
}

/**
 * Durable, cross-instance rate limiting backed by the `rate_limit_events`
 * table and `check_rate_limit` function (see
 * supabase/migrations/20261001000000_rate_limit_events.sql). Replaces the
 * previous in-memory Map, which lost state on every cold start/redeploy and
 * wasn't shared across concurrent serverless instances.
 *
 * Fails closed: if Supabase is unreachable, the request is rejected rather
 * than silently bypassing the limit.
 */
export async function checkRateLimit(
  clientIdentifier: string,
  maxRequests = 10,
  windowSeconds = 60
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const db = createAdminClient()
    const { data, error } = await db.rpc('check_rate_limit', {
      p_client_key: clientIdentifier,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    })
    if (error) throw error
    const result = data?.[0]
    if (!result) throw new Error('check_rate_limit returned no result')
    return { allowed: result.allowed, retryAfter: result.allowed ? undefined : result.retry_after }
  } catch (error) {
    console.error('[RATE LIMIT CHECK FAILED]', error instanceof Error ? error.message : error)
    return { allowed: false, retryAfter: windowSeconds }
  }
}

export function sanitizeString(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip inline JS protocols
    .replace(/onload|onerror|onclick/gi, '') // Strip event handlers
    .trim()
}
