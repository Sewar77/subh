BEGIN;

CREATE TABLE IF NOT EXISTS media_assets (
    id SERIAL PRIMARY KEY,
    secure_url TEXT NOT NULL,
    cloudinary_public_id TEXT,
    original_filename TEXT,
    display_name TEXT,
    mime_type TEXT,
    format TEXT,
    width INTEGER,
    height INTEGER,
    bytes BIGINT,
    alt_text_en TEXT,
    alt_text_ar TEXT,
    source TEXT NOT NULL DEFAULT 'uploaded'
        CHECK (source IN ('uploaded', 'legacy_registered')),
    uploaded_by_admin_id INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT media_assets_secure_url_https
        CHECK (secure_url ~ '^https://'),
    CONSTRAINT media_assets_positive_width
        CHECK (width IS NULL OR width > 0),
    CONSTRAINT media_assets_positive_height
        CHECK (height IS NULL OR height > 0),
    CONSTRAINT media_assets_nonnegative_bytes
        CHECK (bytes IS NULL OR bytes >= 0),
    CONSTRAINT media_assets_uploaded_public_id
        CHECK (
            source = 'legacy_registered'
            OR NULLIF(BTRIM(cloudinary_public_id), '') IS NOT NULL
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_media_assets_secure_url
    ON media_assets (secure_url);

CREATE UNIQUE INDEX IF NOT EXISTS ux_media_assets_cloudinary_public_id
    ON media_assets (cloudinary_public_id)
    WHERE cloudinary_public_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_media_assets_created_at
    ON media_assets (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_media_assets_archived_at
    ON media_assets (archived_at);

CREATE INDEX IF NOT EXISTS ix_media_assets_uploader
    ON media_assets (uploaded_by_admin_id);

CREATE INDEX IF NOT EXISTS ix_media_assets_display_name_lower
    ON media_assets (LOWER(display_name))
    WHERE display_name IS NOT NULL;

COMMIT;
