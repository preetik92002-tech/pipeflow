-- Durable rate limiting backed by Supabase, replacing the previous in-memory
-- (process-local) store in src/lib/forms/spamProtection.ts. State now survives
-- cold starts/redeploys and is shared across concurrent serverless instances.

CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_events_client_key_created_at_idx
  ON public.rate_limit_events (client_key, created_at);

-- Enable RLS with no policies: ordinary anon/authenticated roles get zero
-- access (no SELECT/INSERT/UPDATE/DELETE), public or otherwise. The only way
-- in is the SECURITY DEFINER function below, whose EXECUTE grant is further
-- restricted to service_role.
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

-- Atomically checks-and-increments a sliding-window rate limit for a given
-- client key. Mirrors the semantics of the previous in-memory
-- checkRateLimit(clientIdentifier, maxRequests, windowSeconds): count requests
-- in the trailing window, allow if under the limit (recording this request),
-- otherwise deny with a retry-after in seconds.
--
-- pg_advisory_xact_lock serializes concurrent calls for the same client_key
-- for the lifetime of the calling transaction, so two simultaneous requests
-- from the same client cannot both read the same pre-insert count and both
-- be allowed through when only one slot remains.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_client_key TEXT,
  p_max_requests INT,
  p_window_seconds INT
) RETURNS TABLE(allowed BOOLEAN, retry_after INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_oldest TIMESTAMPTZ;
  v_window INTERVAL := make_interval(secs => p_window_seconds);
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_client_key, 0));

  DELETE FROM public.rate_limit_events
  WHERE client_key = p_client_key
    AND created_at <= now() - v_window;

  SELECT count(*), min(created_at) INTO v_count, v_oldest
  FROM public.rate_limit_events
  WHERE client_key = p_client_key;

  IF v_count >= p_max_requests THEN
    RETURN QUERY SELECT
      false,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_oldest + v_window - now())))::INT);
    RETURN;
  END IF;

  INSERT INTO public.rate_limit_events (client_key) VALUES (p_client_key);

  -- Opportunistic global cleanup (~1% of calls) bounds table growth for
  -- client keys that never return, without requiring pg_cron or any new
  -- infrastructure dependency.
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limit_events WHERE created_at <= now() - INTERVAL '1 hour';
  END IF;

  RETURN QUERY SELECT true, 0;
END;
$$;

-- Lock the function down to service_role only. Server-side route handlers
-- call this exclusively through the existing admin (service-role) Supabase
-- client, never exposed to the browser.
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;
