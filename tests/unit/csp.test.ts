import { afterEach, describe, expect, it, vi } from 'vitest'

async function scriptSrc(nodeEnv: string) {
  vi.stubEnv('NODE_ENV', nodeEnv)
  vi.resetModules()
  const { default: config } = await import('../../next.config')
  const rules = await config.headers!()
  const csp = rules[0].headers.find((h) => h.key === 'Content-Security-Policy')!.value
  return csp.split('; ').find((d) => d.startsWith('script-src '))!
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('Content-Security-Policy script-src', () => {
  it('allows eval in development so React can rebuild stacks', async () => {
    expect(await scriptSrc('development')).toContain("'unsafe-eval'")
  })

  it('never allows eval in production', async () => {
    const directive = await scriptSrc('production')
    expect(directive).not.toContain("'unsafe-eval'")
    expect(directive).toContain("'self'")
  })
})
