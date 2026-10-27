-- Customers can write a review on /reviews. A submission is stored as a hidden testimonial
-- (active = false, source = 'website') and only appears on the site after an admin ticks
-- "Visible on website" in Admin > Customer Reviews. "Verified review" stays an admin decision.
--
-- Active testimonials are publicly readable (all columns), so the reviewer's email lives in a
-- separate private table that only admins and the service role can read. Writes go through
-- POST /api/reviews (validation, rate limit, spam checks) and the submit_customer_review
-- function below, which is executable by service_role only. Safe to run more than once.
BEGIN;

-- Ratings outside 1 to 5 were never meaningful; NOT VALID leaves any old row untouched.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'testimonials_rating_range') THEN
    ALTER TABLE public.testimonials
      ADD CONSTRAINT testimonials_rating_range CHECK (rating BETWEEN 1 AND 5) NOT VALID;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.review_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimonial_id UUID NOT NULL UNIQUE REFERENCES public.testimonials(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  -- True when the email matches a service request we received: a hint for the admin, not proof of a job.
  matches_request BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS review_submissions_email_created_idx
  ON public.review_submissions (lower(email), created_at DESC);

ALTER TABLE public.review_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.review_submissions FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.review_submissions TO service_role;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'review_submissions' AND policyname = 'Admin manage review submissions') THEN
    CREATE POLICY "Admin manage review submissions" ON public.review_submissions
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Saves one website review atomically: the hidden testimonial and its private contact row.
-- Returns NULL (nothing saved) when the same email already sent a review in the last 24 hours.
CREATE OR REPLACE FUNCTION public.submit_customer_review(
  p_name TEXT,
  p_city TEXT,
  p_rating INT,
  p_text TEXT,
  p_service TEXT,
  p_email TEXT
) RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_email TEXT := lower(trim(p_email));
BEGIN
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('review:' || v_email, 0));
  IF EXISTS (
    SELECT 1 FROM public.review_submissions
    WHERE lower(email) = v_email AND created_at > now() - INTERVAL '24 hours'
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.testimonials (reviewer_name, reviewer_city, rating, review_text, service_name, date, verified, source, active, display_order)
  VALUES (p_name, NULLIF(p_city, ''), p_rating, p_text, NULLIF(p_service, ''), to_char(now(), 'FMMonth YYYY'), false, 'website', false, 0)
  RETURNING id INTO v_id;

  INSERT INTO public.review_submissions (testimonial_id, email, matches_request)
  VALUES (v_id, v_email, EXISTS (SELECT 1 FROM public.leads WHERE lower(email) = v_email));

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_customer_review(TEXT, TEXT, INT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_customer_review(TEXT, TEXT, INT, TEXT, TEXT, TEXT) TO service_role;

COMMIT;
