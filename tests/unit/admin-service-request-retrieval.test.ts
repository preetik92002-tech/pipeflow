import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  auth: { authenticated: false, authorized: false, user: null },
  leads: [] as Array<Record<string, unknown>>,
  bookings: [] as Array<Record<string, unknown>>,
  leadError: null as { message: string } | null,
  bookingError: null as { message: string } | null,
  signedUrlError: false,
  tables: [] as string[],
  signedPaths: [] as string[],
}))

vi.mock('@/lib/supabase/auth', () => ({ verifyAdminAuth: async () => state.auth }))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        order: async () => {
          state.tables.push(table)
          return table === 'leads'
            ? { data: state.leads, error: state.leadError }
            : { data: state.bookings, error: state.bookingError }
        },
      }),
    }),
    storage: {
      from: () => ({
        createSignedUrls: async (paths: string[], expiresIn: number) => {
          expect(expiresIn).toBe(3600)
          state.signedPaths.push(...paths)
          return {
            data: state.signedUrlError ? null : paths.map((path) => ({ path, signedUrl: `https://storage.example/${path}?signed` })),
            error: state.signedUrlError ? { message: 'storage unavailable' } : null,
          }
        },
      }),
    },
  }),
}))

import { GET } from '@/app/api/admin/leads/route'

beforeEach(() => {
  state.auth = { authenticated: false, authorized: false, user: null }
  state.leads = []
  state.bookings = []
  state.leadError = null
  state.bookingError = null
  state.signedUrlError = false
  state.tables = []
  state.signedPaths = []
})

describe('service request admin retrieval', () => {
  it('does not query private request tables for an unauthenticated visitor', async () => {
    const response = await GET()
    expect(response.status).toBe(401)
    expect(state.tables).toEqual([])
  })

  it('does not query private request tables for an authenticated non-admin', async () => {
    state.auth = { authenticated: true, authorized: false, user: null }
    const response = await GET()
    expect(response.status).toBe(403)
    expect(state.tables).toEqual([])
  })

  it('returns saved lead fields and signed attachment links to an authorized administrator', async () => {
    state.auth = { authenticated: true, authorized: true, user: null }
    state.leads = [{
      id: '10000000-0000-4000-8000-000000000001', lead_id: 'LD-12345678-0000-4000-8000-000000000001',
      name: 'Sam Example', phone: '3035550100', email: 'sam@example.com', service_category: 'Plumbing',
      specific_service: 'Water Heater Repair', service_area: 'Denver', zip_code: '80202', address: '123 Example St',
      message: 'The water heater is making a noise.', customer_type: 'homeowner', urgency: 'soon', status: 'new',
      lead_type: 'service_request', created_at: '2026-10-19T10:00:00.000Z', attachments: ['folder/0-photo.jpg'],
      lead_notes: [{ id: 'note-1', content: 'Call back', created_at: '2026-10-19T10:01:00.000Z' }],
    }]

    const response = await GET()
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(state.tables).toEqual(['leads', 'bookings'])
    expect(body.leads[0]).toMatchObject({
      id: '10000000-0000-4000-8000-000000000001', lead_id: 'LD-12345678-0000-4000-8000-000000000001',
      name: 'Sam Example', specific_service: 'Water Heater Repair', service_area: 'Denver',
      address: '123 Example St', message: 'The water heater is making a noise.', record_kind: 'lead',
      attachment_links: [{ name: '0-photo.jpg', url: 'https://storage.example/folder/0-photo.jpg?signed' }],
    })
    expect(state.signedPaths).toEqual(['folder/0-photo.jpg'])
  })

  it('marks a record when private attachment links cannot be signed', async () => {
    state.auth = { authenticated: true, authorized: true, user: null }
    state.leads = [{ id: '10000000-0000-4000-8000-000000000001', attachments: ['folder/0-photo.jpg'] }]
    state.signedUrlError = true
    const response = await GET()
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.leads[0].attachment_links).toEqual([])
    expect(body.leads[0].attachment_error).toBe(true)
  })

  it('returns an empty list only when both request queries succeed with no rows', async () => {
    state.auth = { authenticated: true, authorized: true, user: null }
    const response = await GET()
    expect(response.status).toBe(200)
    expect((await response.json()).leads).toEqual([])
  })

  it('reports a database query failure instead of presenting an empty list', async () => {
    state.auth = { authenticated: true, authorized: true, user: null }
    state.leadError = { message: 'query failed' }
    const response = await GET()
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ error: 'Unable to load leads.' })
  })
})
