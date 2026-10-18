-- ROLLBACK for supabase/migrations/20261014000000_server_only_public_form_writes.sql.
-- NOT a migration: it lives outside supabase/migrations on purpose so the Supabase CLI never applies it by itself.
-- Run it by hand, in the SQL editor, only if the website's form submissions fail after the migration was applied.
--
-- It restores the state captured from production (project qhytdwupjsslqqghnlqi) on 2026-10-18, before the migration:
--   * anon and authenticated held INSERT on the three tables (PUBLIC did not, so PUBLIC is not granted anything here);
--   * one INSERT policy per table, for the default role (public), with exactly these checks.
-- Restoring it re-opens direct anonymous inserts through the REST API, so fix the cause and re-apply the migration.
-- Safe to run twice.
BEGIN;
SET LOCAL lock_timeout = '10s';

GRANT INSERT ON TABLE public.leads, public.bookings, public.pro_applications TO anon, authenticated;

DROP POLICY IF EXISTS "Public insert leads" ON public.leads;
CREATE POLICY "Public insert leads" ON public.leads
  FOR INSERT WITH CHECK (
    status = 'new'
    AND assigned_to IS NULL
    AND lead_id ~ '^(LD|QT)-[A-Fa-f0-9-]{36}$'
  );

DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
CREATE POLICY "Public insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    status = 'requested'
    AND lead_id IS NULL
    AND booking_id ~ '^BK-[A-Fa-f0-9-]{36}$'
  );

DROP POLICY IF EXISTS "Public insert pro applications" ON public.pro_applications;
CREATE POLICY "Public insert pro applications" ON public.pro_applications
  FOR INSERT WITH CHECK (
    status = 'new'
    AND notes IS NULL
    AND document_url IS NULL
    AND application_id ~ '^PA-[A-Fa-f0-9-]{36}$'
  );

COMMIT;
