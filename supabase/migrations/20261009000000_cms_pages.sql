-- Generic CMS pages: a page is a stable row (identity, URL, status) that points
-- at two immutable revisions, the current draft and the live version. Visitors
-- only ever read the published revision, so draft edits cannot leak.
--
-- Access: RLS is enabled with no policies, so the anon and authenticated roles
-- have no access at all. The app reads and writes through server-only code that
-- uses the service role key after its own admin check.

CREATE TABLE IF NOT EXISTS public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 180),
  -- Full path without leading or trailing slash, e.g. 'hvac/ac-repair'.
  -- The empty string is the homepage.
  path TEXT NOT NULL CHECK (
    path = ''
    OR (
      char_length(path) <= 200
      AND path ~ '^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*){0,3}$'
    )
  ),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
  draft_revision_id UUID,
  published_revision_id UUID,
  version INT NOT NULL DEFAULT 1,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT cms_pages_published_needs_revision
    CHECK (status <> 'published' OR published_revision_id IS NOT NULL)
);

-- Two live pages can never share a path; soft-deleted pages free theirs.
CREATE UNIQUE INDEX IF NOT EXISTS cms_pages_path_live_idx
  ON public.cms_pages (path) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS cms_pages_status_updated_idx
  ON public.cms_pages (status, updated_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.cms_page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(sections) = 'array'),
  schema_version INT NOT NULL DEFAULT 1,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id, number)
);
CREATE INDEX IF NOT EXISTS cms_page_revisions_page_created_idx
  ON public.cms_page_revisions (page_id, created_at DESC);

ALTER TABLE public.cms_pages
  ADD CONSTRAINT cms_pages_draft_revision_fk
    FOREIGN KEY (draft_revision_id) REFERENCES public.cms_page_revisions(id) DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT cms_pages_published_revision_fk
    FOREIGN KEY (published_revision_id) REFERENCES public.cms_page_revisions(id) DEFERRABLE INITIALLY DEFERRED;

-- Old URLs that now point somewhere else (created when a published page moves).
CREATE TABLE IF NOT EXISTS public.cms_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INT NOT NULL DEFAULT 308 CHECK (status_code IN (301, 308)),
  page_id UUID REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_path <> to_path)
);

-- Append-only record of who changed what.
CREATE TABLE IF NOT EXISTS public.cms_audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cms_audit_log_entity_idx
  ON public.cms_audit_log (entity_type, entity_id, created_at DESC);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_audit_log ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Writes happen in functions so each action is one transaction. Supabase's JS
-- client cannot run multi-statement transactions, and the version check plus
-- row lock below is what stops two editors silently overwriting each other.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cms_create_page(
  p_title TEXT,
  p_path TEXT,
  p_description TEXT,
  p_sections JSONB,
  p_seo_title TEXT,
  p_seo_description TEXT,
  p_og_image TEXT,
  p_canonical_url TEXT,
  p_noindex BOOLEAN,
  p_is_template BOOLEAN,
  p_user UUID
) RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_page UUID := gen_random_uuid();
  v_rev UUID := gen_random_uuid();
BEGIN
  INSERT INTO cms_pages (id, title, path, status, version, is_template, created_by, updated_by)
  VALUES (v_page, p_title, p_path, 'draft', 1, COALESCE(p_is_template, false), p_user, p_user);

  INSERT INTO cms_page_revisions (id, page_id, number, title, description, sections,
    seo_title, seo_description, og_image, canonical_url, noindex, created_by)
  VALUES (v_rev, v_page, 1, p_title, p_description, COALESCE(p_sections, '[]'::jsonb),
    p_seo_title, p_seo_description, p_og_image, p_canonical_url, COALESCE(p_noindex, false), p_user);

  UPDATE cms_pages SET draft_revision_id = v_rev WHERE id = v_page;

  INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
  VALUES (p_user, 'page.create', 'page', v_page, jsonb_build_object('path', p_path));
  RETURN v_page;
END;
$$;

-- Saves a new draft revision. Raises 'version_conflict' (SQLSTATE 40001) when
-- p_expected_version is not the page's current version. A path change on a page
-- that is or was published leaves a redirect from the old path.
CREATE OR REPLACE FUNCTION public.cms_save_draft(
  p_page_id UUID,
  p_expected_version INT,
  p_title TEXT,
  p_path TEXT,
  p_description TEXT,
  p_sections JSONB,
  p_seo_title TEXT,
  p_seo_description TEXT,
  p_og_image TEXT,
  p_canonical_url TEXT,
  p_noindex BOOLEAN,
  p_user UUID
) RETURNS INT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_page cms_pages%ROWTYPE;
  v_rev UUID := gen_random_uuid();
  v_number INT;
BEGIN
  SELECT * INTO v_page FROM cms_pages WHERE id = p_page_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'page_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_page.version <> p_expected_version THEN
    RAISE EXCEPTION 'version_conflict' USING ERRCODE = '40001';
  END IF;

  SELECT COALESCE(MAX(number), 0) + 1 INTO v_number FROM cms_page_revisions WHERE page_id = p_page_id;

  INSERT INTO cms_page_revisions (id, page_id, number, title, description, sections,
    seo_title, seo_description, og_image, canonical_url, noindex, created_by)
  VALUES (v_rev, p_page_id, v_number, p_title, p_description, COALESCE(p_sections, '[]'::jsonb),
    p_seo_title, p_seo_description, p_og_image, p_canonical_url, COALESCE(p_noindex, false), p_user);

  IF p_path IS DISTINCT FROM v_page.path THEN
    -- Unique index rejects a path that another live page already uses.
    UPDATE cms_pages SET path = p_path WHERE id = p_page_id;
    IF v_page.published_at IS NOT NULL THEN
      -- A page can be reached at the new path again, so drop any stale redirect
      -- from it, then point the old path (and anything that pointed at it) here.
      DELETE FROM cms_redirects WHERE from_path = p_path;
      UPDATE cms_redirects SET to_path = p_path WHERE to_path = v_page.path;
      INSERT INTO cms_redirects (from_path, to_path, page_id)
      VALUES (v_page.path, p_path, p_page_id)
      ON CONFLICT (from_path) DO UPDATE SET to_path = EXCLUDED.to_path, page_id = EXCLUDED.page_id;
    END IF;
  END IF;

  UPDATE cms_pages
  SET title = p_title,
      draft_revision_id = v_rev,
      version = version + 1,
      updated_by = p_user,
      updated_at = now()
  WHERE id = p_page_id;

  INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
  VALUES (p_user, 'page.save_draft', 'page', p_page_id,
    jsonb_build_object('revision', v_number, 'path', p_path));
  RETURN v_page.version + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.cms_publish(
  p_page_id UUID,
  p_expected_version INT,
  p_user UUID
) RETURNS INT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_page cms_pages%ROWTYPE;
BEGIN
  SELECT * INTO v_page FROM cms_pages WHERE id = p_page_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'page_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_page.version <> p_expected_version THEN
    RAISE EXCEPTION 'version_conflict' USING ERRCODE = '40001';
  END IF;
  IF v_page.is_template THEN
    RAISE EXCEPTION 'template_not_publishable' USING ERRCODE = 'P0001';
  END IF;

  UPDATE cms_pages
  SET status = 'published',
      published_revision_id = draft_revision_id,
      published_at = now(),
      version = version + 1,
      updated_by = p_user,
      updated_at = now()
  WHERE id = p_page_id;

  -- A live page at this path wins over any old redirect from it.
  DELETE FROM cms_redirects WHERE from_path = v_page.path;

  INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
  VALUES (p_user, 'page.publish', 'page', p_page_id, jsonb_build_object('path', v_page.path));
  RETURN v_page.version + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.cms_unpublish(
  p_page_id UUID,
  p_expected_version INT,
  p_user UUID
) RETURNS INT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_page cms_pages%ROWTYPE;
BEGIN
  SELECT * INTO v_page FROM cms_pages WHERE id = p_page_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'page_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_page.version <> p_expected_version THEN
    RAISE EXCEPTION 'version_conflict' USING ERRCODE = '40001';
  END IF;

  UPDATE cms_pages
  SET status = 'unpublished',
      version = version + 1,
      updated_by = p_user,
      updated_at = now()
  WHERE id = p_page_id;

  INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
  VALUES (p_user, 'page.unpublish', 'page', p_page_id, jsonb_build_object('path', v_page.path));
  RETURN v_page.version + 1;
END;
$$;

-- Soft delete: frees the path and removes redirects that pointed at the page.
CREATE OR REPLACE FUNCTION public.cms_delete_page(
  p_page_id UUID,
  p_user UUID
) RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_page cms_pages%ROWTYPE;
BEGIN
  SELECT * INTO v_page FROM cms_pages WHERE id = p_page_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'page_not_found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE cms_pages
  SET deleted_at = now(), status = CASE WHEN status = 'published' THEN 'unpublished' ELSE status END,
      version = version + 1, updated_by = p_user, updated_at = now()
  WHERE id = p_page_id;
  DELETE FROM cms_redirects WHERE page_id = p_page_id OR to_path = v_page.path;

  INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
  VALUES (p_user, 'page.delete', 'page', p_page_id, jsonb_build_object('path', v_page.path));
END;
$$;

-- Only the service role may call these. Without this, PostgREST would expose
-- them to anyone holding the public anon key.
REVOKE ALL ON FUNCTION public.cms_create_page(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cms_save_draft(UUID, INT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cms_publish(UUID, INT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cms_unpublish(UUID, INT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cms_delete_page(UUID, UUID) FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.cms_create_page(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, UUID) TO service_role;
    GRANT EXECUTE ON FUNCTION public.cms_save_draft(UUID, INT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN, UUID) TO service_role;
    GRANT EXECUTE ON FUNCTION public.cms_publish(UUID, INT, UUID) TO service_role;
    GRANT EXECUTE ON FUNCTION public.cms_unpublish(UUID, INT, UUID) TO service_role;
    GRANT EXECUTE ON FUNCTION public.cms_delete_page(UUID, UUID) TO service_role;
  END IF;
END $$;
