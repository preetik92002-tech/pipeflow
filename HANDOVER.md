# PipeFlow: setup and handover

## 1. Set up the database (Supabase)

Run the files in `supabase/migrations/` in order in the Supabase SQL editor. The newest ones add the page builder and the service request form:

1. `20261009000000_cms_pages.sql` – pages, versions, redirects, audit log
2. `20261009000100_seed_cms_pages.sql` – the launch pages (safe to run again; it never overwrites edited pages)
3. `20261010000000_service_request_fields.sql` – extra request fields and the private `service-requests` bucket for customer photos

Older migrations (initial schema, rate limiting and so on) must already be applied.

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
npm run seed:sql    # regenerate the seed migration after editing supabase/seed/*.ts
```
