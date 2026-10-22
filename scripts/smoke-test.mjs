// Starts the packaged release and checks the important routes. Usage: node scripts/smoke-test.mjs [releaseDir]
// Requires the same NEXT_PUBLIC_SUPABASE_* variables as the build; no secret values are printed.
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const dir = resolve(process.argv[2] ?? 'release')
const port = process.env.SMOKE_PORT ?? '3999'
const base = `http://127.0.0.1:${port}`

const child = spawn(process.execPath, ['server.js'], {
  cwd: dir,
  env: { ...process.env, NODE_ENV: 'production', PORT: port, HOSTNAME: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let log = ''
child.stdout.on('data', (d) => { log += d })
child.stderr.on('data', (d) => { log += d })

const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
const failures = []
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : ` ${detail}`}`)
  if (!ok) failures.push(name)
}

const waitUp = async () => {
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null) throw new Error(`server exited early (code ${child.exitCode})`)
    try { await fetch(base, { redirect: 'manual' }); return } catch { await new Promise((r) => setTimeout(r, 500)) }
  }
  throw new Error('server did not start within 30s')
}

try {
  await waitUp()
  const get = (path) => fetch(base + path, { redirect: 'manual' })

  // CMS-rendered pages read Supabase with the service-role key at runtime; without it they can only 500.
  const home = await get('/')
  if (hasServiceKey) check('GET / returns 200', home.status === 200, `got ${home.status}`)
  else console.log('SKIP  CMS-rendered routes (/, /sitemap.xml, 404 page): SUPABASE_SERVICE_ROLE_KEY not set')
  check('security headers present', ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'content-security-policy'].every((h) => home.headers.get(h)))
  check('CSP has no unsafe-eval in production', !(home.headers.get('content-security-policy') ?? '').includes('unsafe-eval'))
  const html = await (await get('/book-service')).text()
  const asset = html.match(/\/_next\/static\/[^"')\s]+\.(?:js|css)/)?.[0]
  check('/book-service references a static asset', Boolean(asset))
  if (asset) check('static asset is served', (await get(asset)).status === 200)

  const legacy = await get('/services/plumbing')
  check('legacy redirect /services/plumbing -> /plumbing (308)', legacy.status === 308 && (legacy.headers.get('location') ?? '').endsWith('/plumbing'), `got ${legacy.status}`)
  const alias = await get('/book')
  check('middleware alias /book -> /book-service', [307, 308].includes(alias.status) && (alias.headers.get('location') ?? '').endsWith('/book-service'), `got ${alias.status}`)
  const admin = await get('/admin')
  check('/admin does not render unauthenticated', [301, 302, 303, 307, 308].includes(admin.status), `got ${admin.status}`)
  check('GET /book-service returns 200', (await get('/book-service')).status === 200)
  check('GET /robots.txt returns 200', (await get('/robots.txt')).status === 200)
  if (hasServiceKey) {
    check('GET /sitemap.xml returns 200', (await get('/sitemap.xml')).status === 200)
    check('unknown route returns 404', (await get('/definitely-not-a-page-xyz')).status === 404)
  }
  check('server log has no GLIBC / BUILD_ID errors', !/GLIBC|BUILD_ID|ENOENT|ERR_DLOPEN/.test(log), log.slice(-500))
} catch (error) {
  failures.push('startup')
  console.error(`FAIL  ${error.message}\n${log.slice(-1500)}`)
} finally {
  child.kill()
}
process.exit(failures.length ? 1 : 0)
