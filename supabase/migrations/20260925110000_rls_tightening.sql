-- Tighten public reads to rows that are actually displayed by the website.
-- Form submissions remain public INSERT-only; lead and application reads stay admin-only.

DROP POLICY IF EXISTS "Public read active service categories" ON public.service_categories;
CREATE POLICY "Public read active service categories" ON public.service_categories
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public read service area zips" ON public.service_area_zips;
CREATE POLICY "Public read service area zips" ON public.service_area_zips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_areas area
      WHERE area.id = service_area_zips.service_area_id AND area.active = true
    )
  );

DROP POLICY IF EXISTS "Public read service area services" ON public.service_area_services;
CREATE POLICY "Public read service area services" ON public.service_area_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_areas area
      JOIN public.services service ON service.id = service_area_services.service_id
      WHERE area.id = service_area_services.service_area_id
        AND area.active = true AND service.active = true
    )
  );

DROP POLICY IF EXISTS "Public read blog tag relations" ON public.blog_tag_relations;
CREATE POLICY "Public read blog tag relations" ON public.blog_tag_relations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blogs blog
      WHERE blog.id = blog_tag_relations.blog_id
        AND blog.status = 'published' AND blog.published_at <= NOW()
    )
  );

DROP POLICY IF EXISTS "Public read blog media" ON public.blog_media;
CREATE POLICY "Public read blog media" ON public.blog_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blogs blog
      WHERE blog.id = blog_media.blog_id
        AND blog.status = 'published' AND blog.published_at <= NOW()
    )
  );

-- Avoid exposing arbitrary site settings and unused contractor document uploads.
DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public upload pro documents" ON storage.objects;

-- Anonymous form access is INSERT-only with server-managed workflow fields.
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
