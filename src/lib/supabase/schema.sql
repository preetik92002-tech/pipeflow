-- PipeFlow Co. Database Schema
-- Run this in your Supabase SQL editor to initialize the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- SITE CONFIGURATION (key-value store for admin settings)
-- ============================================================
create table if not exists site_config (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value jsonb not null,
  description text,
  updated_at timestamptz default now()
);

-- ============================================================
-- SERVICE AREAS
-- ============================================================
create table if not exists service_areas (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  state text not null default 'CO',
  description text,
  active boolean default true,
  primary_area boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SERVICES
-- ============================================================
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  category text not null check (category in ('plumbing', 'hvac', 'emergency', 'other')),
  short_description text,
  description text,
  icon_name text,
  image_url text,
  featured boolean default false,
  emergency boolean default false,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TESTIMONIALS / REVIEWS
-- ============================================================
create table if not exists testimonials (
  id uuid default uuid_generate_v4() primary key,
  reviewer_name text not null,
  reviewer_city text,
  rating int check (rating >= 1 and rating <= 5),
  review_text text not null,
  service_name text,
  review_date date,
  verified boolean default false,
  source text check (source in ('google', 'yelp', 'bbb', 'internal')),
  active boolean default true,
  featured boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- TRUST BADGES
-- ============================================================
create table if not exists trust_badges (
  id uuid default uuid_generate_v4() primary key,
  label text not null,
  icon_name text,
  description text,
  image_url text,
  sort_order int default 0,
  active boolean default true
);

-- ============================================================
-- FAQs
-- ============================================================
create table if not exists faqs (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  category text,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
create table if not exists blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  category text,
  image_url text,
  author text,
  featured boolean default false,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LEADS (form submissions)
-- ============================================================
create table if not exists leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text not null,
  email text,
  service_type text,
  service_area text,
  message text,
  preferred_time text,
  is_emergency boolean default false,
  source text default 'website',
  status text default 'new' check (status in ('new', 'contacted', 'booked', 'closed', 'spam')),
  created_at timestamptz default now()
);

-- ============================================================
-- QUOTE REQUESTS
-- ============================================================
create table if not exists quote_requests (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text not null,
  email text,
  address text,
  service_type text,
  description text,
  preferred_date date,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ============================================================
-- PRO APPLICATIONS (Join as a Pro)
-- ============================================================
create table if not exists pro_applications (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  trade text not null check (trade in ('plumbing', 'hvac', 'both', 'other')),
  years_experience int,
  license_number text,
  service_areas text[],
  message text,
  resume_url text,
  status text default 'pending' check (status in ('pending', 'reviewing', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table leads enable row level security;
alter table quote_requests enable row level security;
alter table pro_applications enable row level security;
alter table testimonials enable row level security;
alter table blog_posts enable row level security;
alter table services enable row level security;
alter table service_areas enable row level security;
alter table faqs enable row level security;
alter table trust_badges enable row level security;
alter table site_config enable row level security;

-- Public read policies
create policy "Public can read active service_areas"
  on service_areas for select using (active = true);

create policy "Public can read active services"
  on services for select using (active = true);

create policy "Public can read active testimonials"
  on testimonials for select using (active = true);

create policy "Public can read active faqs"
  on faqs for select using (active = true);

create policy "Public can read published blog_posts"
  on blog_posts for select using (published = true);

create policy "Public can read active trust_badges"
  on trust_badges for select using (active = true);

create policy "Public can read site_config"
  on site_config for select using (true);

-- Public insert for form submissions
create policy "Anyone can submit lead"
  on leads for insert with check (true);

create policy "Anyone can submit quote"
  on quote_requests for insert with check (true);

create policy "Anyone can apply as pro"
  on pro_applications for insert with check (true);
