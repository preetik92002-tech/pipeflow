import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSupabasePublicEnv, getSupabaseServiceEnv } from '@/lib/supabase/env'
import { GET } from '@/app/api/public/supabase-config/route'

// Supabase settings are read at runtime so the build never contains the keys (Netlify secret scanning
// fails the deploy otherwise). A literal `process.env.NEXT_PUBLIC_SUPABASE_*` anywhere in src brings them back.
const SRC = path.join(__dirname, '../../src')
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? files(full) : /\.(ts|tsx)$/.test(name) ? [full] : []
  })

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Supabase runtime settings', () => {
  it('no source file reads a Supabase variable by literal name (that is compiled into the build)', () => {
    const offenders = files(SRC).filter((f) => /process\.env\.(NEXT_PUBLIC_SUPABASE|SUPABASE)_/.test(readFileSync(f, 'utf8')))
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([])
  })

  it('reads the values when the code runs, and treats missing or placeholder values as not configured', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ' https://example.supabase.co ')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key')
    expect(getSupabasePublicEnv()).toEqual({ url: 'https://example.supabase.co', anonKey: 'anon-key' })
    expect(getSupabaseServiceEnv()).toEqual({ url: 'https://example.supabase.co', serviceRoleKey: 'service-key' })
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key')
    expect(getSupabasePublicEnv()).toBeNull()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    expect(getSupabaseServiceEnv()).toBeNull()
  })

  it('gives the browser the URL and anon key, never the service-role key', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key')
    const res = await GET()
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(JSON.parse(text)).toEqual({ url: 'https://example.supabase.co', anonKey: 'anon-key' })
    expect(text).not.toContain('service-key')
  })

  it('answers 503 when Supabase is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    expect((await GET()).status).toBe(503)
  })
})
