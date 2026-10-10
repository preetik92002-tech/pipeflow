-- City/service URLs ek hi pattern par: /<trade>/<service>/<city>, jaise plumbing/water-heater-repair/denver.
-- Aur water heater page ke CTAs ko sahi service par point karna.
--
-- Safe to run more than once. Nothing here publishes anything or deletes anything.
--
-- Poori file ek transaction hai: koi bhi step fail ho to sab rollback, aadha-adhura state nahi bachta.
-- Production par ise SQL editor mein haath se chalaya jaata hai (supabase db push se nahi).
-- lock_timeout: agar koi admin usi waqt page save kar raha ho to lambe wait ki jagah fail ho jaye;
-- tab dobara chalana safe hai.
BEGIN;
SET LOCAL lock_timeout = '10s';

-- 1. Purane prefixes (water/, frozen/, ac/) wale city drafts ko naye path par le jao.
--    Sirf woh pages move hote hain jo kabhi publish nahi hue: unka koi public URL nahi tha,
--    isliye redirect ki zaroorat nahi. Agar naye path par pehle se koi page hai to skip,
--    taaki duplicate ya unique-index error na bane.
DO $$
DECLARE
  m RECORD;
  v_page cms_pages%ROWTYPE;
BEGIN
  FOR m IN
    SELECT * FROM (VALUES
      ('water/water-heater-repair/denver', 'plumbing/water-heater-repair/denver'),
      ('water/water-heater-repair/boulder', 'plumbing/water-heater-repair/boulder'),
      ('water/water-heater-replacement/denver', 'plumbing/water-heater-replacement/denver'),
      ('water/water-heater-replacement/boulder', 'plumbing/water-heater-replacement/boulder'),
      ('frozen/frozen-pipe-repair/denver', 'plumbing/frozen-pipe-repair/denver'),
      ('frozen/frozen-pipe-repair/boulder', 'plumbing/frozen-pipe-repair/boulder'),
      ('ac/ac-repair/denver', 'hvac/ac-repair/denver'),
      ('ac/ac-repair/boulder', 'hvac/ac-repair/boulder'),
      ('ac/ac-installation/denver', 'hvac/ac-installation/denver'),
      ('ac/ac-installation/boulder', 'hvac/ac-installation/boulder')
    ) AS t(old_path, new_path)
  LOOP
    SELECT * INTO v_page FROM cms_pages WHERE path = m.old_path AND deleted_at IS NULL FOR UPDATE;
    CONTINUE WHEN NOT FOUND;
    CONTINUE WHEN v_page.status <> 'draft' OR v_page.published_at IS NOT NULL;
    CONTINUE WHEN EXISTS (SELECT 1 FROM cms_pages WHERE path = m.new_path AND deleted_at IS NULL);

    UPDATE cms_pages SET path = m.new_path, version = version + 1, updated_at = now() WHERE id = v_page.id;
    INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
    VALUES (NULL, 'page.move', 'page', v_page.id, jsonb_build_object('from', m.old_path, 'to', m.new_path));
  END LOOP;
END $$;

-- 2. Water heater page: har button ka service uske label ke hisaab se.
--    Badlav ek NAYE DRAFT revision mein jaata hai (cms_save_draft); live page tab tak same rehta
--    hai jab tak admin preview karke Publish na kare. Purana revision History mein bacha rehta hai.
--
--    Do safety rules:
--    a) Agar page par unpublished edits hain (draft revision != published revision) to kuch nahi
--       badalta. Warna in edits par fix lagta aur "Publish" dabane par woh edits bhi live ho jaate
--       bina kisi ke dekhe. Aisi situation mein admin editor mein buttons khud theek kare.
--    b) Sirf wahi button badalta hai jiska label AUR link dono bilkul seed wale hain. Buttons CMS
--       structure se padhe jaate hain (har section ka data.button aur data.buttons[]), text replace
--       se nahi. Admin ne link ya label badla hai to woh button, aur baaki saara content, waisa hi rehta hai.
--    Skip hone par cms_audit_log mein 'migration.water_heater_ctas.skipped' entry banti hai (reason ke saath),
--    har draft revision ke liye ek hi baar, taaki dobara chalane par log na bhare.
DO $$
DECLARE
  v_page cms_pages%ROWTYPE;
  v_rev cms_page_revisions%ROWTYPE;
  v_new JSONB;
  v_changed INT;
  v_reason TEXT;
  c_old CONSTANT TEXT := '/book-service?category=plumbing&service=water-heater-repair';
  -- label -> sahi link
  c_map CONSTANT JSONB := jsonb_build_object(
    'Get Water Heater Replacement Help', '/book-service?category=plumbing&service=water-heater-replacement',
    'Request Water Heater Installation', '/book-service?category=plumbing&service=water-heater-installation',
    'Explore Water Heater Installation Options', '/book-service?category=plumbing&service=water-heater-installation',
    'Request Commercial Water Heater Service', '/book-service?category=plumbing&type=business'
  );
BEGIN
  SELECT * INTO v_page FROM cms_pages
  WHERE path = 'plumbing/water-heater-repair' AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RAISE NOTICE 'water heater CTAs skipped: no live page at plumbing/water-heater-repair';
    RETURN;
  END IF;

  -- Ye fix ek hi baar lagta hai. Dobara chalane par (ya baad mein admin ke edits ke baad) kuch nahi hota.
  IF EXISTS (SELECT 1 FROM cms_audit_log WHERE action = 'migration.water_heater_ctas.applied' AND entity_id = v_page.id) THEN
    RAISE NOTICE 'water heater CTAs already applied';
    RETURN;
  END IF;

  IF v_page.is_template OR v_page.status <> 'published' OR v_page.published_revision_id IS NULL THEN
    v_reason := 'page is not published';
  ELSIF v_page.draft_revision_id IS DISTINCT FROM v_page.published_revision_id THEN
    v_reason := 'page has unpublished changes; fix the buttons in the editor';
  END IF;
  IF v_reason IS NOT NULL THEN
    RAISE NOTICE 'water heater CTAs skipped: %', v_reason;
    IF NOT EXISTS (
      SELECT 1 FROM cms_audit_log
      WHERE action = 'migration.water_heater_ctas.skipped' AND entity_id = v_page.id
        AND meta->>'draft_revision_id' IS NOT DISTINCT FROM v_page.draft_revision_id::text
    ) THEN
      INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
      VALUES (NULL, 'migration.water_heater_ctas.skipped', 'page', v_page.id,
        jsonb_build_object('reason', v_reason, 'draft_revision_id', v_page.draft_revision_id, 'published_revision_id', v_page.published_revision_id));
    END IF;
    RETURN;
  END IF;

  SELECT * INTO v_rev FROM cms_page_revisions WHERE id = v_page.draft_revision_id;
  IF NOT FOUND OR jsonb_typeof(v_rev.sections) <> 'array' THEN
    RAISE NOTICE 'water heater CTAs skipped: draft revision missing or malformed';
    RETURN;
  END IF;

  -- Har section ko order mein dobara banao; sirf matching button ka href badalta hai.
  SELECT COALESCE(jsonb_agg(
    CASE
      -- data na ho ya object na ho to section bina chhede waisa hi (NULL-safe comparison).
      WHEN jsonb_typeof(s->'data') IS DISTINCT FROM 'object' THEN s
      ELSE jsonb_set(s, '{data}',
        (s->'data')
        || CASE WHEN jsonb_typeof(s->'data'->'button') = 'object'
             AND s->'data'->'button'->>'href' = c_old AND c_map ? (s->'data'->'button'->>'label')
           THEN jsonb_build_object('button', jsonb_set(s->'data'->'button', '{href}', c_map->(s->'data'->'button'->>'label')))
           ELSE '{}'::jsonb END
        || CASE WHEN jsonb_typeof(s->'data'->'buttons') = 'array'
           THEN jsonb_build_object('buttons', (
             SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(b) = 'object' AND b->>'href' = c_old AND c_map ? (b->>'label')
                 THEN jsonb_set(b, '{href}', c_map->(b->>'label')) ELSE b END
               ORDER BY bi), '[]'::jsonb)
             FROM jsonb_array_elements(s->'data'->'buttons') WITH ORDINALITY AS x(b, bi)))
           ELSE '{}'::jsonb END)
    END
    ORDER BY si), '[]'::jsonb)
  INTO v_new
  FROM jsonb_array_elements(v_rev.sections) WITH ORDINALITY AS y(s, si);

  IF v_new IS DISTINCT FROM v_rev.sections THEN
    SELECT count(*) INTO v_changed FROM (
      SELECT b FROM jsonb_array_elements(v_rev.sections) s,
        LATERAL (SELECT s->'data'->'button' AS b UNION ALL SELECT jsonb_array_elements(CASE WHEN jsonb_typeof(s->'data'->'buttons') = 'array' THEN s->'data'->'buttons' ELSE '[]'::jsonb END)) bs
      WHERE jsonb_typeof(b) = 'object' AND b->>'href' = c_old AND c_map ? (b->>'label')
    ) c;
    PERFORM cms_save_draft(
      v_page.id, v_page.version, v_rev.title, v_page.path, v_rev.description, v_new,
      v_rev.seo_title, v_rev.seo_description, v_rev.og_image, v_rev.canonical_url, v_rev.noindex, NULL
    );
    INSERT INTO cms_audit_log (actor_id, action, entity_type, entity_id, meta)
    VALUES (NULL, 'migration.water_heater_ctas.applied', 'page', v_page.id,
      jsonb_build_object('buttons_changed', v_changed, 'based_on_revision_id', v_rev.id));
  END IF;
END $$;

COMMIT;
