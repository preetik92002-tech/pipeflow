-- Public form writes must pass through the server APIs, which validate input,
-- apply rate limits and spam checks, and manage workflow-owned columns.
-- The API routes use the service-role client only after those checks succeed.
-- This migration removes direct anon/authenticated table inserts without
-- changing read policies or the private admin workflows.
BEGIN;

REVOKE INSERT ON TABLE public.leads, public.bookings, public.pro_applications
  FROM PUBLIC, anon, authenticated;

GRANT INSERT ON TABLE public.leads, public.bookings, public.pro_applications
  TO service_role;

DROP POLICY IF EXISTS "Public insert leads" ON public.leads;
DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public insert pro applications" ON public.pro_applications;

COMMIT;
