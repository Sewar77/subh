BEGIN;

-- This migration is additive. It deliberately leaves section_translations and
-- any legacy section_media join table in place for read compatibility.

ALTER TABLE public.sections
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.section_content (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,
    field_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT section_content_locale_chk
        CHECK (locale IN ('en', 'ar', 'neutral')),
    CONSTRAINT section_content_field_key_chk
        CHECK (field_key ~ '^[A-Za-z][A-Za-z0-9]*$'),
    CONSTRAINT section_content_field_type_chk
        CHECK (field_type IN ('text', 'textarea', 'url', 'boolean', 'integer', 'decimal')),
    CONSTRAINT section_content_identity_uniq
        UNIQUE (section_id, locale, field_key)
);

-- A distinct name avoids altering or replacing deployments that already have
-- the legacy section_media(section_id, media_id, role, position) relation.
CREATE TABLE IF NOT EXISTS public.section_media_items (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    slot_key VARCHAR(100) NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    file_ref TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    alt_en VARCHAR(160),
    alt_ar VARCHAR(160),
    caption_en VARCHAR(400),
    caption_ar VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT section_media_items_slot_key_chk
        CHECK (slot_key ~ '^[A-Za-z][A-Za-z0-9_]*$'),
    CONSTRAINT section_media_items_type_chk
        CHECK (media_type IN ('image', 'video', 'file')),
    CONSTRAINT section_media_items_position_chk CHECK (position >= 0),
    CONSTRAINT section_media_items_file_ref_chk CHECK (LENGTH(file_ref) BETWEEN 1 AND 2048)
);

CREATE INDEX IF NOT EXISTS idx_section_content_section
    ON public.section_content(section_id);
CREATE INDEX IF NOT EXISTS idx_section_media_items_section_slot_position
    ON public.section_media_items(section_id, slot_key, position, id);
CREATE INDEX IF NOT EXISTS idx_sections_public_page_position
    ON public.sections(page_id, is_visible, is_archived, position, id);

COMMIT;
