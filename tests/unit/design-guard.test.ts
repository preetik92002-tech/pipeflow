import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = join(process.cwd(), 'src')
function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(tsx?|css)$/.test(f)) out.push(p)
  }
  return out
}

describe('design guards', () => {
  it('globals.css declares no smooth scrolling (it breaks navigation scroll restoration)', () => {
    const css = readFileSync(join(root, 'app/globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).not.toMatch(/scroll-behavior\s*:\s*smooth/)
  })
})
