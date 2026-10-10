import type { RequestPrefill } from '@/components/request/RequestServiceFlow'
import { CITIES, SERVICES, URGENCY } from './schema'

export type PrefillParams = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** What a /book-service link pre-selects. Unknown values are ignored, never trusted. */
export function toPrefill(sp: PrefillParams): RequestPrefill {
  const category = one(sp.category) === 'hvac' ? 'hvac' : one(sp.category) === 'plumbing' ? 'plumbing' : undefined
  const serviceParam = one(sp.service)
  const service = category && serviceParam && SERVICES[category].some((s) => s.value === serviceParam) ? serviceParam : undefined
  const cityParam = one(sp.city)?.toLowerCase()
  const city = CITIES.find((c) => c.toLowerCase() === cityParam)
  const urgency = URGENCY.find((u) => u.value === one(sp.urgency))?.value
  const customerType = one(sp.type) === 'business' ? 'business' : category ? 'homeowner' : one(sp.type) === 'homeowner' ? 'homeowner' : undefined
  return { category, service, city, urgency, customerType }
}
