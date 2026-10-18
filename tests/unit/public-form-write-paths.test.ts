import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ tables: [] as string[], sessionClientCalls: 0 }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      insert: async () => {
        state.tables.push(table)
        return { error: null }
      },
    }),
  }),
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => {
    state.sessionClientCalls++
    throw new Error('Public write routes should not insert with the session client.')
  },
}))
vi.mock('@/lib/forms/spamProtection', async (load) => {
  const actual = await load<typeof import('@/lib/forms/spamProtection')>()
  return {
    ...actual,
    checkRateLimit: async () => ({ allowed: true }),
    checkSpam: () => ({ isSpam: false, reason: null }),
  }
})

import { POST as submitLead } from '@/app/api/leads/route'
import { POST as submitBooking } from '@/app/api/bookings/route'
import { POST as submitProApplication } from '@/app/api/pro-applications/route'

const post = (url: string, body: Record<string, unknown>) =>
  new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

beforeEach(() => {
  state.tables = []
  state.sessionClientCalls = 0
})

describe('public form APIs use the restricted server-side write path', () => {
  it('saves validated leads through the admin client', async () => {
    const response = await submitLead(post('/api/leads', {
      name: 'Sam Example', phone: '3035550100', serviceCategory: 'Plumbing', specificService: 'Water Heater Repair',
    }))
    expect(response.status).toBe(201)
    expect(state.tables).toEqual(['leads'])
    expect(state.sessionClientCalls).toBe(0)
  })

  it('saves validated bookings through the admin client', async () => {
    const response = await submitBooking(post('/api/bookings', {
      name: 'Sam Example', phone: '3035550100', serviceCategory: 'Plumbing', specificService: 'Water Heater Repair', zipCode: '80202',
    }))
    expect(response.status).toBe(201)
    expect(state.tables).toEqual(['bookings'])
    expect(state.sessionClientCalls).toBe(0)
  })

  it('saves validated professional applications through the admin client', async () => {
    const response = await submitProApplication(post('/api/pro-applications', {
      name: 'Sam Example', phone: '3035550100', email: 'sam@example.com', trade: 'plumbing',
    }))
    expect(response.status).toBe(201)
    expect(state.tables).toEqual(['pro_applications'])
    expect(state.sessionClientCalls).toBe(0)
  })
})
