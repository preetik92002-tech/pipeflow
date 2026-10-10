import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': path.resolve(__dirname, 'src'), 'server-only': path.resolve(__dirname, 'tests/helpers/server-only.ts') } },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node',
    testTimeout: 30000,
    // Each database test file starts its own in-process Postgres; several at once can take a while.
    hookTimeout: 60000,
    // Ek waqt mein ek file: kai in-process Postgres saath chalne par chhoti machines (6 GB RAM) par
    // memory khatam ho jaati hai aur workers bina error ke mar jaate hain. Tests wahi hain, sirf order serial hai.
    fileParallelism: false,
  },
})
