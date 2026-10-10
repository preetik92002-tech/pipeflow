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
  it('public site files use square corners only', () => {
    // components/admin aur components/ui (sirf admin use karta hai) is guard se bahar hain
    const adminOnly = ['components/admin/', 'components/ui/Badge', 'components/ui/Button', 'components/ui/Card', 'components/ui/Modal', 'components/ui/Skeleton', 'components/ui/Toast']
    const files = [...walk(join(root, 'components')), ...walk(join(root, 'app/(site)'))].filter((f) => {
      const n = f.split(String.fromCharCode(92)).join('/')
      return !adminOnly.some((a) => n.includes(a))
    })
    const offenders = files.filter((f) => /rounded(-(?!none)[a-z0-9]+)?(?=[\s"'`])/.test(readFileSync(f, 'utf8').replace(/rounded-none/g, '')))
    expect(offenders.map((f) => f.replace(root, ''))).toEqual([])
  })
})
