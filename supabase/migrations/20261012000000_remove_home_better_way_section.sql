-- Home page: remove the "A Better Way to Find Plumbing & HVAC Help" feature grid.
--
-- Targeted and re-runnable. Only that one section is dropped, and only when it is still exactly the
-- seeded one (same heading and the same six card titles). Every other section keeps its content and
-- order. The About page has its own, separate copy and is not touched.
--
-- The change goes into a NEW DRAFT revision (cms_save_draft); the live page stays as it is until an
-- admin previews and presses Publish, and the old revision stays in History. If the home page has
-- unpublished edits, nothing changes and the section must be deleted in the editor instead.
BEGIN;
SET LOCAL lock_timeout = '10s';

DO $$
DECLARE
  v_page cms_pages%ROWTYPE;
  v_rev cms_page_revisions%ROWTYPE;
  v_new JSONB;
  c_titles CONSTANT JSONB := '["Local Options","Easy Service Requests","Photo Uploads","Convenient Scheduling","Residential & Commercial Support","Clear Professional Profiles"]'::jsonb;
BEGIN
  SELECT * INTO v_page FROM cms_pages WHERE path = '' AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RAISE NOTICE 'better-way section: no home page, nothing to do';
    RETURN;
  END IF;
  IF v_page.draft_revision_id IS DISTINCT FROM v_page.published_revision_id THEN
    RAISE NOTICE 'better-way section skipped: the home page has unpublished changes; delete the section in the editor';
    RETURN;
  END IF;

  SELECT * INTO v_rev FROM cms_page_revisions WHERE id = v_page.draft_revision_id;
  IF NOT FOUND OR jsonb_typeof(v_rev.sections) <> 'array' THEN
    RAISE NOTICE 'better-way section skipped: revision missing or malformed';
    RETURN;
  END IF;

  SELECT COALESCE(jsonb_agg(s ORDER BY si), '[]'::jsonb) INTO v_new
  FROM jsonb_array_elements(v_rev.sections) WITH ORDINALITY AS y(s, si)
  WHERE NOT (
    s->>'type' = 'featureCards'
    AND s->'data'->>'heading' = 'A Better Way to Find Plumbing & HVAC Help'
    AND jsonb_typeof(s->'data'->'cards') = 'array'
    AND (SELECT COALESCE(jsonb_agg(c->>'title' ORDER BY ci), '[]'::jsonb)
         FROM jsonb_array_elements(s->'data'->'cards') WITH ORDINALITY AS z(c, ci)) = c_titles
  );

  IF v_new IS DISTINCT FROM v_rev.sections THEN
    PERFORM cms_save_draft(
      v_page.id, v_page.version, v_rev.title, v_page.path, v_rev.description, v_new,
      v_rev.seo_title, v_rev.seo_description, v_rev.og_image, v_rev.canonical_url, v_rev.noindex, NULL
    );
    INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
    VALUES (NULL, 'migration.home_better_way_removed', 'page', v_page.id,
      jsonb_build_object('based_on_revision_id', v_rev.id));
  END IF;
END $$;

COMMIT;
