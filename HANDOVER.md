# PipeFlow: setup and handover

## 1. Set up the database (Supabase)

The ordered SQL files in `supabase/migrations/` are the database change history. This repository has no `supabase/config.toml` or project reference, so verify the target project before linking the CLI. The newest migrations add the page builder, request form, service pages, homepage draft change, and server-only form writes:

1. `20261009000000_cms_pages.sql` – pages, versions, redirects, audit log
2. `20261009000100_seed_cms_pages.sql` – the launch pages (safe to run again; it never overwrites edited pages)
3. `20261010000000_service_request_fields.sql` – extra request fields and the private `service-requests` bucket for customer photos
4. `20261011000000_city_service_urls_and_water_heater_ctas.sql` – safe URL moves and a water-heater draft update
5. `20261012000000_remove_home_better_way_section.sql` – removes only the unchanged seeded homepage section into a draft
6. `20261013000000_service_pages.sql` – creates missing service pages as drafts; existing paths are reported and left untouched
7. `20261014000000_server_only_public_form_writes.sql` – removes direct public table inserts; validated server APIs remain the submission path
8. `20261027000000_customer_review_submissions.sql` – lets customers write reviews on `/reviews`; they are saved hidden until approved in Admin > Customer Reviews, with the reviewer's email kept in a private table

Older migrations (initial schema, rate limiting and so on) must already be applied.

### Verify migration history before any database change

1. Confirm the project reference in Supabase Dashboard matches the intended environment. Do not infer production from `.env.local`.
2. If `supabase/config.toml` is absent, initialize local CLI configuration with `supabase init` and review its generated defaults. This only creates local configuration; it does not connect to or change a remote database.
3. With the Supabase CLI authenticated, link this checkout to that verified reference if it is not already linked: `supabase link --project-ref <VERIFIED_PROJECT_REF>`. Linking records local CLI configuration; it does not apply migrations.
4. Compare local files with the remote migration ledger using the read-only command `supabase migration list --linked`.
5. If migrations were run manually in the SQL Editor, compare the ledger with the actual schema and migration effects. Manual execution may not have recorded a CLI migration version. Do not use `supabase migration repair` to make the ledger appear synchronized without reconciling the database first.
6. Before an authorized change, back up affected CMS page rows and their draft/published revisions. For the homepage change, retain the original published revision. Do not include customer records in content backups.

`supabase db push` applies remote changes and must only be run after the project, migration differences, backups, and approval have been verified. This audit does not run it.

## 2. Environment variables

See `.env.example`. Set them in Vercel (Production and Preview) and redeploy.

## 3. First admin user

In Supabase > Authentication create a user, then set its `app_metadata` to `{"role": "super_admin"}` (SQL: `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"super_admin"}' where email = '…'`). Turn on MFA for that user and use a long unique password.

## 4. Daily use (admin)

- **Pages**: create, edit, duplicate, preview, publish and unpublish pages. Use any URL, including nested ones such as `/plumbing/water-heater-repair`. Changing a page's URL leaves a redirect from the old one. The Service page template is a good page to duplicate.
- **Navigation**: edit the top menu, footer lists and the main button.
- **Version history**: every save is kept. Open a page and press History to load an older version.
- **Leads**: service requests, with photos and videos, appear under Leads & Inquiries.
- **Media Library**: upload images to use in pages.

Pages marked "noindex" are hidden from search engines. Untick it in the page's SEO settings when the copy is ready.

## 5. Developing

```
npm install --legacy-peer-deps
npm test            # unit, database (PGlite) and render tests
npx tsc --noEmit
npm run lint
npm run seed:sql    # regenerate the seed migration after editing supabase/seed/*.ts (needs Node 22.6 or newer)
```
