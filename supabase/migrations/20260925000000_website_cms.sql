-- Canonical website CMS content. Existing services, service_areas, blogs,
-- testimonials, faqs, media and service_categories tables are reused.
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id TEXT PRIMARY KEY CHECK (id = 'home'),
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.service_categories
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

ALTER TABLE public.service_areas
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_service_areas_order ON public.service_areas(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_category_order ON public.services(category, active, display_order);
CREATE INDEX IF NOT EXISTS idx_blogs_publication ON public.blogs(status, published_at DESC);

ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='homepage_content' AND policyname='Public reads homepage content') THEN
    CREATE POLICY "Public reads homepage content" ON public.homepage_content FOR SELECT USING (id = 'home');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='homepage_content' AND policyname='Admins manage homepage content') THEN
    CREATE POLICY "Admins manage homepage content" ON public.homepage_content FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

INSERT INTO public.service_categories(name, slug, description, sort_order, active)
VALUES ('Plumbing', 'plumbing', 'Residential plumbing repairs and installations.', 1, true),
       ('HVAC', 'hvac', 'Residential heating, ventilation, and air conditioning.', 2, true)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, active=true;

INSERT INTO public.services(title, slug, category, short_description, description, image_url, active, featured, display_order)
VALUES
('Leak Repair', 'leak-repair', 'plumbing', 'Fast leak detection and repair for Colorado homes.', 'Repair visible and hidden water leaks with careful diagnostics.', '/assets/service-plumbing.jpg', true, true, 1),
('Drain Cleaning', 'drain-cleaning', 'plumbing', 'Clear slow or blocked drains with professional equipment.', 'Drain clearing and hydro-jetting for kitchen, bath, and sewer lines.', '/assets/service-detail-2.jpg', true, true, 2),
('Water Heater', 'water-heater', 'plumbing', 'Repair and replacement for tank and tankless water heaters.', 'Water heater diagnostics, repair, and replacement.', '/assets/service-plumbing.jpg', true, true, 3),
('Pipe Repair & Repiping', 'pipe-repair', 'plumbing', 'Repair damaged pipes and plan whole-home repiping.', 'Pipe repair and repiping for aging, corroded, and frozen lines.', '/assets/service-detail-2.jpg', true, false, 4),
('Faucet & Fixture Repair', 'faucet-fixture-repair', 'plumbing', 'Repair leaks and install plumbing fixtures.', 'Fixture repairs and installations for kitchens and bathrooms.', '/assets/service-plumbing.jpg', true, false, 5),
('Sewer Services', 'sewer-services', 'plumbing', 'Sewer inspection, clearing, and repair.', 'Camera inspections and sewer line repair options.', '/assets/service-detail-2.jpg', true, false, 6),
('AC Repair', 'ac-repair', 'hvac', 'Restore cooling with residential AC diagnostics and repair.', 'Air conditioning troubleshooting, repairs, and seasonal support.', '/assets/hero-hvac-tech.jpg', true, true, 1),
('AC Installation', 'ac-installation', 'hvac', 'Cooling system installation sized for your home.', 'High-efficiency air conditioning replacement and installation.', '/assets/hero-hvac-tech.jpg', true, false, 2),
('Heating / Furnace', 'heating-furnace', 'hvac', 'Furnace repair and heating system replacement.', 'Heating diagnostics, furnace repair, and replacement.', '/assets/hero-hvac-tech.jpg', true, true, 3),
('HVAC Maintenance', 'hvac-maintenance', 'hvac', 'Seasonal system checks to keep heating and cooling running.', 'Preventive maintenance for residential HVAC systems.', '/assets/hero-hvac-tech.jpg', true, false, 4),
('Heat Pumps', 'heat-pumps', 'hvac', 'Cold-climate heat pump repair and installation.', 'Heat pump solutions for year-round comfort.', '/assets/hero-hvac-tech.jpg', true, false, 5),
('Indoor Air Quality', 'indoor-air-quality', 'hvac', 'Filtration and humidity solutions for healthier indoor air.', 'Whole-home air quality and humidity improvements.', '/assets/hero-hvac-tech.jpg', true, false, 6)
ON CONFLICT (slug) DO NOTHING;

UPDATE public.services AS service
SET category_id = category.id
FROM public.service_categories AS category
WHERE service.category = category.slug AND service.category_id IS NULL;

INSERT INTO public.service_areas(name, slug, state, active, primary_area, sort_order)
VALUES ('Denver','denver','CO',true,true,1),('Aurora','aurora','CO',true,false,2),('Lakewood','lakewood','CO',true,false,3),
('Englewood','englewood','CO',true,false,4),('Littleton','littleton','CO',true,false,5),('Arvada','arvada','CO',true,false,6),
('Westminster','westminster','CO',true,false,7),('Thornton','thornton','CO',true,false,8),('Centennial','centennial','CO',true,false,9),
('Parker','parker','CO',true,false,10),('Brighton','brighton','CO',true,false,11),('Castle Rock','castle-rock','CO',true,false,12)
ON CONFLICT (slug) DO NOTHING;

WITH zips(area_slug, zip_code) AS (VALUES
('denver','80202'),('denver','80203'),('denver','80204'),('denver','80205'),('denver','80206'),('denver','80207'),('denver','80209'),('denver','80210'),('denver','80211'),('denver','80212'),('denver','80218'),('denver','80220'),
('aurora','80010'),('aurora','80011'),('aurora','80012'),('aurora','80013'),('aurora','80014'),('aurora','80015'),('aurora','80016'),('aurora','80017'),
('lakewood','80214'),('lakewood','80215'),('lakewood','80226'),('lakewood','80227'),('lakewood','80228'),('lakewood','80232'),
('englewood','80110'),('englewood','80111'),('englewood','80112'),('englewood','80113'),
('littleton','80120'),('littleton','80121'),('littleton','80122'),('littleton','80123'),('littleton','80127'),('littleton','80128'),
('arvada','80001'),('arvada','80002'),('arvada','80003'),('arvada','80004'),('arvada','80005'),('arvada','80007'),
('westminster','80020'),('westminster','80021'),('westminster','80030'),('westminster','80031'),
('thornton','80229'),('thornton','80233'),('thornton','80241'),('thornton','80260'),
('centennial','80015'),('centennial','80112'),('centennial','80121'),('centennial','80122'),
('parker','80134'),('parker','80138'),('brighton','80601'),('brighton','80602'),('brighton','80603'),('castle-rock','80104'),('castle-rock','80108'),('castle-rock','80109')
)
INSERT INTO public.service_area_zips(service_area_id, zip_code)
SELECT areas.id, zips.zip_code FROM zips JOIN public.service_areas areas ON areas.slug = zips.area_slug
ON CONFLICT (service_area_id, zip_code) DO NOTHING;

INSERT INTO public.faqs(id, question, answer, category, sort_order, active)
VALUES ('c2a4f012-e2cd-4d53-b443-316a9ee03101','What areas does PipeFlow Co. serve?','We serve Denver and nearby Front Range communities. Use the ZIP checker to confirm service availability.','home',1,true),
('c2a4f012-e2cd-4d53-b443-316a9ee03102','Do you offer emergency plumbing or HVAC service?','Yes. We provide emergency response for severe leaks, burst pipes, no-heat calls, and air conditioning breakdowns.','home',2,true),
('c2a4f012-e2cd-4d53-b443-316a9ee03103','How do I schedule a service appointment?','Book online, request a quote, or call our dispatch desk to arrange an appointment.','home',3,true),
('c2a4f012-e2cd-4d53-b443-316a9ee03104','Are your technicians licensed and insured in Colorado?','PipeFlow works with qualified, insured plumbing and HVAC professionals.','home',4,true),
('c2a4f012-e2cd-4d53-b443-316a9ee03105','Do you provide pricing before starting work?','A technician will explain options and pricing before work begins.','home',5,true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blogs(title, slug, excerpt, body, featured_image, featured_image_alt, author, status, published_at, category_name, category_slug, seo_title, seo_description)
VALUES
('How to Prevent Frozen Pipes During a Colorado Cold Snap','prevent-frozen-pipes-colorado-winter','Essential steps every Denver homeowner should take when sub-zero temperatures arrive in the Front Range.','Colorado temperatures can fall quickly during winter. Insulate exposed pipes, open cabinet doors around exterior plumbing, disconnect garden hoses before the first freeze, and keep the home warm. If a pipe freezes, shut off water if a leak appears and use gentle heat to thaw it.','/assets/service-detail-2.jpg','Technician checking indoor water lines for winter freeze insulation','PipeFlow Team','published','2025-02-12T08:00:00Z','Plumbing Tips','plumbing','How to Prevent Frozen Pipes in Denver | PipeFlow Co.','Steps Denver homeowners can take to protect plumbing during cold snaps.'),
('Heat Pumps vs. Traditional Furnaces: What Makes Sense in Colorado?','heat-pumps-vs-furnaces-colorado-climate','Compare dual-fuel hybrid heat pumps with standard gas furnaces for altitude efficiency and energy savings.','Modern cold-climate heat pumps can provide efficient heating through much of a Colorado winter. A dual-fuel system pairs a heat pump for moderate conditions with a furnace for the coldest weather. Home size, insulation, utility rates, and equipment sizing all affect the right choice.','/assets/hero-hvac-tech.jpg','HVAC technician installing a modern heat pump','PipeFlow Team','published','2025-02-05T09:00:00Z','HVAC Guide','hvac','Heat Pumps vs. Furnaces in Colorado | PipeFlow Co.','Compare heat pumps and furnaces for Colorado homes.'),
('5 Warning Signs Your Water Heater Is About to Fail','warning-signs-water-heater-failure','Rusty hot water, strange rumbling sounds, or slow recovery times? Here is what to inspect before a leak.','Watch for rusty hot water, rumbling noises, moisture around the tank, reduced hot-water capacity, and an aging unit. If the tank itself leaks, shut off the water supply and arrange professional replacement to prevent damage.','/assets/service-plumbing.jpg','Plumber inspecting water heater connections in a residential utility room','PipeFlow Team','published','2025-02-14T08:00:00Z','Plumbing Tips','plumbing','5 Warning Signs of Water Heater Failure | PipeFlow Co.','Learn common water heater failure signs and when to arrange service.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.homepage_content(id, content) VALUES ('home', jsonb_build_object(
  'hero', jsonb_build_object('eyebrow','Denver Plumbing & HVAC','headline','Fast. Reliable. Right on Time.','description','Trusted plumbing and HVAC care for Colorado homes.','primaryCtaText','Book a Service','primaryCtaUrl','/book-service','secondaryCtaText','Get a Quote','secondaryCtaUrl','/get-a-quote','image','/assets/scrol1.png','active',true),
  'services', jsonb_build_object('heading','What do you need help with?','description','Plumbing and HVAC service from trusted local professionals.','ids',jsonb_build_array(),'active',true),
  'stats', jsonb_build_array(jsonb_build_object('number','24/7','label','Emergency dispatch','active',true,'order',1),jsonb_build_object('number','Same day','label','Appointments available','active',true,'order',2)),
  'trust', jsonb_build_array(jsonb_build_object('title','Clear Communication','description','We explain the issue in plain English and provide upfront options.','iconName','message-square','active',true,'order',1),jsonb_build_object('title','Qualified Professionals','description','Vetted plumbing and HVAC professionals ready to help.','iconName','award','active',true,'order',2),jsonb_build_object('title','Reliable Scheduling','description','Confirmed appointment windows and proactive updates.','iconName','clock','active',true,'order',3)),
  'process', jsonb_build_object('heading','How it works','description','Getting help is simple.','active',true,'steps',jsonb_build_array(jsonb_build_object('title','Tell us what you need','description','Share a few details about the issue.','order',1),jsonb_build_object('title','Choose a service time','description','Request an appointment window that works for you.','order',2),jsonb_build_object('title','A qualified pro helps','description','A local professional diagnoses and resolves the issue.','order',3))),
  'testimonialIds',jsonb_build_array(),
  'serviceAreas',jsonb_build_object('heading','Serving the Front Range','description','Check service availability near you.','slugs',jsonb_build_array(),'active',true),
  'faqIds',jsonb_build_array('c2a4f012-e2cd-4d53-b443-316a9ee03101','c2a4f012-e2cd-4d53-b443-316a9ee03102','c2a4f012-e2cd-4d53-b443-316a9ee03103','c2a4f012-e2cd-4d53-b443-316a9ee03104','c2a4f012-e2cd-4d53-b443-316a9ee03105'),
  'faqHeading','Frequently Asked Questions','faqDescription','Have more questions? Contact our team.',
  'promotion',jsonb_build_object('heading','Whole-home plumbing & HVAC inspection','description','Schedule a comprehensive home systems check.','ctaText','Claim this offer','ctaUrl','/book-service','image','/assets/hero-services.jpg','active',true),
  'finalCta',jsonb_build_object('heading','Ready to get started?','description','Schedule trusted plumbing or HVAC service today.','ctaText','Book a Service','ctaUrl','/book-service')
)) ON CONFLICT (id) DO NOTHING;

-- Public read rules expose active CMS records only. Administrative writes are
-- performed through authenticated server routes using the service-role key.
