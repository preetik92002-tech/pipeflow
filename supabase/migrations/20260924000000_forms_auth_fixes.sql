-- Support general contact requests that do not include a ZIP code.
ALTER TABLE public.leads ALTER COLUMN zip_code DROP NOT NULL;

-- Let signed-in users read their own role; middleware still denies access by default.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END
$$;
