-- SUBH CMS RESET PRECHECK
-- READ-ONLY. Run this BEFORE deleting any CMS data.
-- It captures the exact live page/section/template/content contract so the
-- replacement seed can be written safely for the current database.

-- 1) Current pages
SELECT
    id,
    key,
    name,
    status,
    created_at,
    updated_at
FROM public.pages
ORDER BY id;

-- 2) Current section structure
SELECT
    s.id,
    s.page_id,
    p.key AS page_key,
    p.name AS page_name,
    s.type AS template_key,
    s.position,
    s.is_visible,
    s.is_archived,
    s.created_at,
    s.updated_at
FROM public.sections AS s
JOIN public.pages AS p
  ON p.id = s.page_id
ORDER BY p.key, s.position, s.id;

-- 3) Exact canonical content fields currently used by each template.
-- This is the most important result: it tells us which field_key values
-- the current renderer/backend actually persists.
SELECT
    s.type AS template_key,
    sc.locale,
    sc.field_key,
    sc.field_type,
    COUNT(*) AS rows_using_field,
    MIN(LEFT(sc.field_value, 180)) AS example_value
FROM public.section_content AS sc
JOIN public.sections AS s
  ON s.id = sc.section_id
GROUP BY
    s.type,
    sc.locale,
    sc.field_key,
    sc.field_type
ORDER BY
    s.type,
    sc.locale,
    sc.field_key;

-- 4) Appearance values currently stored as neutral content records.
SELECT
    s.type AS template_key,
    sc.field_key,
    ARRAY_AGG(DISTINCT sc.field_value ORDER BY sc.field_value) AS values_seen
FROM public.section_content AS sc
JOIN public.sections AS s
  ON s.id = sc.section_id
WHERE sc.locale = 'neutral'
GROUP BY s.type, sc.field_key
ORDER BY s.type, sc.field_key;

-- 5) Existing media-slot contract observed in live data.
SELECT
    s.type AS template_key,
    smi.slot_key,
    smi.media_type,
    COUNT(*) AS item_count
FROM public.section_media_items AS smi
JOIN public.sections AS s
  ON s.id = smi.section_id
GROUP BY
    s.type,
    smi.slot_key,
    smi.media_type
ORDER BY
    s.type,
    smi.slot_key,
    smi.media_type;

-- 6) Check whether legacy CMS tables still contain rows.
SELECT
    to_regclass('public.section_translations') AS section_translations_table,
    to_regclass('public.section_media') AS legacy_section_media_table,
    to_regclass('public.section_content') AS section_content_table,
    to_regclass('public.section_media_items') AS section_media_items_table;

-- If section_translations exists, run this separately if pgAdmin accepts it:
-- SELECT COUNT(*) FROM public.section_translations;
--
-- If legacy section_media exists:
-- SELECT COUNT(*) FROM public.section_media;

-- 7) Current counts (useful for confirming the later reset)
SELECT
    (SELECT COUNT(*) FROM public.pages) AS pages,
    (SELECT COUNT(*) FROM public.sections) AS sections,
    (SELECT COUNT(*) FROM public.section_content) AS section_content_rows,
    (SELECT COUNT(*) FROM public.section_media_items) AS section_media_items;
