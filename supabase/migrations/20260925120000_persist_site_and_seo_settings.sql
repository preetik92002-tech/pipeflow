ALTER TABLE public.analytics_settings
  ADD COLUMN IF NOT EXISTS google_ads_conversion_label TEXT;

ALTER TABLE public.seo_settings
  ADD COLUMN IF NOT EXISTS canonical_domain TEXT,
  ADD COLUMN IF NOT EXISTS homepage_title TEXT,
  ADD COLUMN IF NOT EXISTS homepage_description TEXT;

DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
CREATE POLICY "Public read safe site settings" ON public.site_settings
  FOR SELECT USING (setting_key IN ('company_info', 'emergency_banner', 'operating_hours'));

-- SEO defaults are intended for public metadata; write access remains admin-only.
DROP POLICY IF EXISTS "Public read seo settings" ON public.seo_settings;
CREATE POLICY "Public read seo settings" ON public.seo_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read analytics settings" ON public.analytics_settings;
CREATE POLICY "Public read analytics settings" ON public.analytics_settings
  FOR SELECT USING (true);
