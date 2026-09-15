-- ====================================================================
-- PipeFlow Co. — Complete Supabase PostgreSQL Schema & Security
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 2. User Profiles & Roles
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Full system and user access'),
  ('admin', 'Operations, leads, and dispatch management'),
  ('editor', 'Blog and content publishing access'),
  ('marketing', 'Analytics and marketing attribution reporting')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' REFERENCES public.roles(name),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. Service Categories & Services
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL, -- 'plumbing' | 'hvac' | 'emergency'
  short_description TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'wrench',
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::JSONB,
  pricing_note TEXT,
  availability TEXT DEFAULT 'Same-day dispatch available',
  featured BOOLEAN DEFAULT false,
  emergency BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  faqs JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(active);

-- --------------------------------------------------------------------
-- 4. Service Areas & Location Coverage
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  state TEXT DEFAULT 'CO',
  description TEXT,
  hero_image TEXT,
  active BOOLEAN DEFAULT true,
  primary_area BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_area_zips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_area_id UUID NOT NULL REFERENCES public.service_areas(id) ON DELETE CASCADE,
  zip_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_area_id, zip_code)
);

CREATE TABLE IF NOT EXISTS public.service_area_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_area_id UUID NOT NULL REFERENCES public.service_areas(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_area_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_service_areas_slug ON public.service_areas(slug);
CREATE INDEX IF NOT EXISTS idx_service_area_zips_code ON public.service_area_zips(zip_code);

-- --------------------------------------------------------------------
-- 5. Lead CRM, Attribution & Inquiries
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_category TEXT NOT NULL,
  specific_service TEXT,
  service_area TEXT,
  zip_code TEXT NOT NULL,
  message TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  photo_name TEXT,
  photo_size INT,
  is_emergency BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'new', -- 'new' | 'contacted' | 'qualified' | 'scheduled' | 'in_progress' | 'closed_won' | 'closed_lost' | 'spam'
  lead_type TEXT DEFAULT 'service_request', -- 'service_request' | 'quote_request' | 'booking_request' | 'contact' | 'professional_application'
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Marketing Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  fbclid TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'status_change' | 'assignment' | 'note_added' | 'email_sent' | 'call_logged'
  details JSONB DEFAULT '{}'::JSONB,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_zip ON public.leads(zip_code);

-- --------------------------------------------------------------------
-- 6. Bookings & Inquiries
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_category TEXT NOT NULL,
  specific_service TEXT NOT NULL,
  address TEXT,
  zip_code TEXT NOT NULL,
  preferred_date TEXT,
  preferred_time TEXT,
  problem_description TEXT,
  is_emergency BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'requested', -- 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  fbclid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- --------------------------------------------------------------------
-- 7. Pro Trade Partner Applications
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pro_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  trade TEXT NOT NULL, -- 'plumbing' | 'hvac' | 'both'
  experience TEXT,
  service_areas TEXT[],
  license_info TEXT,
  insurance_info TEXT,
  website TEXT,
  message TEXT,
  document_url TEXT,
  document_name TEXT,
  status TEXT DEFAULT 'new', -- 'new' | 'under_review' | 'contacted' | 'approved' | 'rejected' | 'onboarding'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_apps_status ON public.pro_applications(status);

-- --------------------------------------------------------------------
-- 8. Blog Engine
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  excerpt TEXT,
  author TEXT NOT NULL DEFAULT 'PipeFlow Team',
  author_role TEXT,
  author_avatar TEXT,
  featured_image TEXT,
  featured_image_alt TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  category_name TEXT,
  category_slug TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft', -- 'draft' | 'scheduled' | 'published' | 'archived'
  body TEXT NOT NULL DEFAULT '',
  reading_time_minutes INT DEFAULT 3,
  canonical_url TEXT,
  noindex BOOLEAN DEFAULT false,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  faqs JSONB DEFAULT '[]'::JSONB,
  cta_type TEXT DEFAULT 'plumbing',
  related_service_slug TEXT,
  related_service_area_slug TEXT,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_tag_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  UNIQUE(blog_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.blog_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs(published_at);

-- --------------------------------------------------------------------
-- 9. General Media Library
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'site-media',
  alt_text TEXT,
  caption TEXT,
  width INT,
  height INT,
  media_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 10. Testimonials, FAQs & Offers
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_name TEXT NOT NULL,
  reviewer_city TEXT,
  rating INT DEFAULT 5,
  review_text TEXT NOT NULL,
  service_name TEXT,
  date TEXT,
  verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'google',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_code TEXT,
  disclaimer TEXT,
  cta_text TEXT DEFAULT 'Claim Offer',
  cta_href TEXT DEFAULT '/book-service',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 11. Website Pages, Navigation & Site Settings
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  noindex BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  title TEXT,
  content JSONB DEFAULT '{}'::JSONB,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  location TEXT DEFAULT 'header', -- 'header' | 'footer' | 'mobile'
  parent_id UUID REFERENCES public.navigation_items(id),
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::JSONB,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  default_title TEXT NOT NULL,
  title_template TEXT NOT NULL,
  default_description TEXT NOT NULL,
  keywords TEXT[],
  default_og_image TEXT,
  robots_txt_custom TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ga_measurement_id TEXT,
  google_ads_id TEXT,
  meta_pixel_id TEXT,
  tracking_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 12. Storage Buckets Configuration
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('site-media', 'site-media', true),
  ('blog-media', 'blog-media', true),
  ('service-media', 'service-media', true),
  ('pro-documents', 'pro-documents', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ====================================================================
-- 13. Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS across all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_area_zips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_area_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if requesting user has an admin/staff role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor', 'marketing')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Read Policies (for active public website content)
CREATE POLICY "Public read active services" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "Public read active service categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Public read active service areas" ON public.service_areas FOR SELECT USING (active = true);
CREATE POLICY "Public read service area zips" ON public.service_area_zips FOR SELECT USING (true);
CREATE POLICY "Public read service area services" ON public.service_area_services FOR SELECT USING (true);
CREATE POLICY "Public read published blogs" ON public.blogs FOR SELECT USING (status = 'published' AND published_at <= NOW());
CREATE POLICY "Public read blog categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Public read blog tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Public read blog tag relations" ON public.blog_tag_relations FOR SELECT USING (true);
CREATE POLICY "Public read blog media" ON public.blog_media FOR SELECT USING (true);
CREATE POLICY "Public read active testimonials" ON public.testimonials FOR SELECT USING (active = true);
CREATE POLICY "Public read active faqs" ON public.faqs FOR SELECT USING (active = true);
CREATE POLICY "Public read active offers" ON public.offers FOR SELECT USING (active = true);
CREATE POLICY "Public read active pages" ON public.pages FOR SELECT USING (active = true);
CREATE POLICY "Public read active page sections" ON public.page_sections FOR SELECT USING (active = true);
CREATE POLICY "Public read active navigation items" ON public.navigation_items FOR SELECT USING (active = true);
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read seo settings" ON public.seo_settings FOR SELECT USING (true);

-- Public Insert Policies (Leads, Bookings, Pro Applications)
CREATE POLICY "Public insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert pro applications" ON public.pro_applications FOR INSERT WITH CHECK (true);

-- Admin Full Access Policies (Admins can perform all actions)
CREATE POLICY "Admin manage services" ON public.services FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage service categories" ON public.service_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage service areas" ON public.service_areas FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage service area zips" ON public.service_area_zips FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage service area services" ON public.service_area_services FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage leads" ON public.leads FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage lead notes" ON public.lead_notes FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage lead events" ON public.lead_events FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage lead assignments" ON public.lead_assignments FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage bookings" ON public.bookings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage pro applications" ON public.pro_applications FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage blogs" ON public.blogs FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage blog categories" ON public.blog_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage blog tags" ON public.blog_tags FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage blog tag relations" ON public.blog_tag_relations FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage blog media" ON public.blog_media FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage media" ON public.media FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage faqs" ON public.faqs FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage offers" ON public.offers FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage pages" ON public.pages FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage page sections" ON public.page_sections FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage navigation items" ON public.navigation_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage seo settings" ON public.seo_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manage analytics settings" ON public.analytics_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin view profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Storage Policies
CREATE POLICY "Public read site-media" ON storage.objects FOR SELECT USING (bucket_id IN ('site-media', 'blog-media', 'service-media'));
CREATE POLICY "Admin upload public media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('site-media', 'blog-media', 'service-media') AND public.is_admin()
);
CREATE POLICY "Public upload pro documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pro-documents');
CREATE POLICY "Admin read pro documents" ON storage.objects FOR SELECT USING (bucket_id = 'pro-documents' AND public.is_admin());

-- ====================================================================
-- 14. Seed Data (Clearly Marked Placeholders)
-- ====================================================================
INSERT INTO public.site_settings (setting_key, setting_value, description) VALUES
  ('company_info', '{
    "name": "PipeFlow Co.",
    "phone": "(720) 555-0100",
    "email": "hello@pipeflowco.com",
    "city": "Denver",
    "state": "CO",
    "zip": "80202",
    "tagline": "Flowing Comfort. Built to Last."
  }'::JSONB, 'Primary business details [DEMO / PLACEHOLDER]'),
  ('emergency_banner', '{
    "enabled": true,
    "text": "🚨 24/7 Emergency Dispatch Available Across Denver Metro: (720) 555-0100"
  }'::JSONB, 'Global emergency announcement banner')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.seo_settings (default_title, title_template, default_description, keywords) VALUES
  (
    'PipeFlow Co. — Denver Plumbing & HVAC Services',
    '%s | PipeFlow Co.',
    'Reliable Plumbing & HVAC Service When You Need It. PipeFlow Co. provides expert plumbing and HVAC solutions across Denver and surrounding Colorado communities.',
    ARRAY['Denver plumbing', 'Denver HVAC', 'emergency plumber Denver', 'furnace repair Denver', 'AC repair Denver']
  )
ON CONFLICT DO NOTHING;
