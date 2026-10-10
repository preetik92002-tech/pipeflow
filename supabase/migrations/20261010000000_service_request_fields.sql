-- Service request flow: extra lead fields and a private bucket for customer photos and videos.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS customer_type TEXT,
  ADD COLUMN IF NOT EXISTS urgency TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments TEXT[] NOT NULL DEFAULT '{}';

-- Private. Files are uploaded through short-lived signed URLs issued by the server,
-- and read by admins through signed URLs. No public or anonymous storage policies.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('service-requests', 'service-requests', false, 52428800,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
