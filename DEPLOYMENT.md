# Deployment (Namecheap shared hosting, cPanel Node.js)

## Netlify deployment

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` in the Netlify project's environment variables, never
in committed files. The public variables must be available during builds; the
service-role key must be available to server functions at runtime.

Next.js intentionally embeds `NEXT_PUBLIC_*` values in browser bundles. The
`netlify.toml` configuration excludes only the public Supabase URL and anonymous
key from secrets scanning. Scanning remains enabled for other values, including
the service-role key, whose client module is protected by `server-only`.
Use only an anonymous/public key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`; never put a
service-role or secret key in a public variable. Public database access continues
to depend on Supabase Row Level Security policies.

If a subsequent deploy identifies `SUPABASE_SERVICE_ROLE_KEY`, inspect the exact
reported file and remove the exposure rather than expanding the scanning
exception. Rotate that key if it was exposed. Local `.env` files are already
ignored; `.env.example` is the tracked template.

## Architecture
- `npm run build` runs `next build --webpack` with `output: 'standalone'`. `scripts/package-release.mjs`
  assembles `release/` (standalone server, `.next/static`, `public`) and validates it.
- The standalone server needs no `next.config.ts` transpile (the cause of the host's
  `GLIBC_2.29` SWC error) and no `npm install` on the server. The host never runs a build.
- On the server: `<app root>/releases/<id>/` (kept: last 5), `current` symlink, and a stable `app.js` shim
  (`require('./current/server.js')`) so cPanel's startup file stays `app.js`. cPanel environment variables
  (`SUPABASE_SERVICE_ROLE_KEY`, ...) are unchanged and are not part of the release.
- `src/proxy.ts` (Next 16 successor of `middleware.ts`) must live in `src/`; at the repo root it was ignored.

## GitHub configuration
Repository variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SITE_URL` (real site URL, e.g. `https://pipeflowco.com`),
optional `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID`.
Secret: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (needed at build; the build reads Supabase while prerendering).

Environments `staging` and `production` (add required reviewers to production), each with secrets
`DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` (private key, authorized on the server), `DEPLOY_PATH`
(cPanel application root), and variable `DEPLOY_HEALTH_URL` (a public URL that must return 200, e.g. `/robots.txt`).

## Workflows
- **CI** (`ci.yml`): push to `main`, pull requests, and reused by Deploy. `npm ci`, typecheck, lint, tests, build,
  release validation, smoke test inside AlmaLinux 8 (glibc 2.28), uploads `pipeflow-release` artifact.
- **Deploy** (`deploy.yml`): manual (`workflow_dispatch`, choose environment). Runs CI, then uploads the artifact,
  boots it on a loopback port with the cPanel Node binary (preflight), switches `current`, touches `tmp/restart.txt`,
  health-checks, and rolls back automatically on failure.

## Manual rollback
Upload `scripts/rollback-remote.sh` and run `bash rollback-remote.sh <app root> [release_id]`, or repoint `current`
to an older `releases/<id>` and `touch tmp/restart.txt`.

## Safety notes
- A cPanel Node.js app maps one domain to one app root. Do not point `pipeflowco.com` at a release that has not passed
  the staging checks; create a separate staging subdomain/app root and use the `staging` environment for it.
- `NEXT_PUBLIC_*` values are compiled in at build time; changing them in cPanel has no effect on an existing release.
- Customer-facing CMS pages need `SUPABASE_SERVICE_ROLE_KEY` in the cPanel environment at runtime.
