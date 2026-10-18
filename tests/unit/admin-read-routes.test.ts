import { beforeEach, describe, expect, it, vi } from 'vitest'

type Auth = { authenticated: boolean; authorized: boolean }
const state = vi.hoisted(() => ({
  auth: { authenticated: false, authorized: false } as Auth,
  rows: [{ id: '1' }] as unknown[],
  dbError: null as { message: string } | null,
  tables: [] as string[],
  sessionClientCalls: 0,
}))

vi.mock('@/lib/supabase/auth', () => ({ verifyAdminAuth: async () => state.auth }))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        order: async () => {
          state.tables.push(table)
          return state.dbError ? { data: null, error: state.dbError } : { data: state.rows, error: null }
        },
      }),
    }),
  }),
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => {
    state.sessionClientCalls++
    throw new Error('Admin reads must not use the RLS-filtered session client.')
  },
}))
vi.mock('@/lib/forms/spamProtection', async (load) => ({ ...(await load<typeof import('@/lib/forms/spamProtection')>()), checkRateLimit: async () => ({ allowed: true }) }))

import { GET as listLeads } from '@/app/api/leads/route'
import { GET as listBookings } from '@/app/api/bookings/route'
import { GET as listApplications } from '@/app/api/pro-applications/route'

const routes = [
  { name: 'leads', get: listLeads, table: 'leads', key: 'leads' },
  { name: 'bookings', get: listBookings, table: 'bookings', key: 'bookings' },
  { name: 'pro applications', get: listApplications, table: 'pro_applications', key: 'applications' },
] as const

beforeEach(() => {
  state.auth = { authenticated: false, authorized: false }
  state.rows = [{ id: '1' }]
  state.dbError = null
  state.tables = []
  state.sessionClientCalls = 0
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe.each(routes)('admin list: $name', ({ get, table, key }) => {
  it('rejects anonymous callers without touching the database', async () => {
    const res = await get()
    expect(res.status).toBe(401)
    expect(state.tables).toEqual([])
  })

  it('rejects signed-in users who are not admins', async () => {
    state.auth = { authenticated: true, authorized: false }
    const res = await get()
    expect(res.status).toBe(403)
    expect(state.tables).toEqual([])
  })

  it('returns the rows for an authorized admin, read through the server-only client', async () => {
    state.auth = { authenticated: true, authorized: true }
    const res = await get()
    expect(res.status).toBe(200)
    expect((await res.json())[key]).toEqual(state.rows)
    expect(state.tables).toEqual([table])
    expect(state.sessionClientCalls).toBe(0)
  })

  it('answers 503 with a generic message when the database fails', async () => {
    state.auth = { authenticated: true, authorized: true }
    state.dbError = { message: 'relation "secret_internal" is unavailable' }
    const res = await get()
    expect(res.status).toBe(503)
    expect(JSON.stringify(await res.json())).not.toContain('secret_internal')
  })
})
