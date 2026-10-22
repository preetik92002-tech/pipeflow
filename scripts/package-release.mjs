// Assembles the deployable release from `next build` (output: 'standalone') into ./release
// and validates it. Usage: node scripts/package-release.mjs
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const standalone = join(root, '.next', 'standalone')
const out = join(root, 'release')

const fail = (message) => {
  console.error(`package-release: ${message}`)
  process.exit(1)
}

if (!existsSync(join(standalone, 'server.js'))) fail('.next/standalone/server.js is missing; run "npm run build" first.')
if (!existsSync(join(root, '.next', 'BUILD_ID'))) fail('.next/BUILD_ID is missing.')

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
cpSync(standalone, out, { recursive: true })
cpSync(join(root, '.next', 'static'), join(out, '.next', 'static'), { recursive: true })
if (existsSync(join(root, 'public'))) cpSync(join(root, 'public'), join(out, 'public'), { recursive: true })

const walk = (dir, visit) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, visit)
    else visit(full, name)
  }
}

// Never ship secrets, logs or caches, whatever the tracer copied.
walk(out, (full, name) => {
  if (/^\.env(\..*)?$/.test(name) && name !== '.env.example') rmSync(full)
  else if (name.endsWith('.log')) rmSync(full)
})
rmSync(join(out, '.next', 'cache'), { recursive: true, force: true })

writeFileSync(join(out, 'RELEASE'), `${process.env.GITHUB_SHA ?? 'local'}\n`)

// Validate the runtime files and that nothing sensitive or platform-specific slipped in.
const required = ['server.js', 'package.json', 'RELEASE', '.next/BUILD_ID', '.next/static', 'public', 'node_modules/next/package.json']
for (const file of required) if (!existsSync(join(out, file))) fail(`release is missing ${file}`)
if (statSync(join(out, '.next', 'BUILD_ID')).size === 0) fail('.next/BUILD_ID is empty')

const nativeFiles = []
const secretLike = []
walk(out, (full, name) => {
  if (name.endsWith('.node')) nativeFiles.push(full.slice(out.length + 1))
  if (/^\.env/.test(name) && name !== '.env.example') secretLike.push(full)
})
if (secretLike.length) fail(`environment files found in release: ${secretLike.join(', ')}`)
if (process.platform === 'linux') {
  const wrong = nativeFiles.filter((file) => /win32|darwin/.test(file))
  if (wrong.length) fail(`non-Linux native modules in release: ${wrong.join(', ')}`)
}
if (nativeFiles.some((file) => file.includes('@next/swc'))) fail('the Next.js SWC binary must not be part of the runtime release')

const serverJs = readFileSync(join(out, 'server.js'), 'utf8')
if (!serverJs.includes('startServer')) fail('server.js does not look like the Next.js standalone server')

console.log(`release ready: ${out} (${nativeFiles.length} native module(s): ${nativeFiles.join(', ') || 'none'})`)
