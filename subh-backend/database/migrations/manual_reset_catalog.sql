-- MANUAL DEVELOPMENT CATALOG RESET
-- ============================================================
-- DESTRUCTIVE: This removes all rows and recreates:
--   public.book_authors
--   public.books
--   public.authors
--   public.categories
--
-- It intentionally DOES NOT modify public.users.
--
-- Safety:
-- - The entire operation runs in one transaction.
-- - No CASCADE is used. If another table depends on one of these
--   catalog tables, PostgreSQL will stop and roll back instead of
--   silently deleting dependent objects.
-- - Run only after taking a backup and confirming the current
--   catalog data may be permanently deleted.
-- ============================================================

BEGIN;

-- Drop dependent catalog tables first.
DROP TABLE IF EXISTS public.book_authors;
DROP TABLE IF EXISTS public.books;
DROP TABLE IF EXISTS public.authors;
DROP TABLE IF EXISTS public.categories;

-- -----------------------------
-- Categories
-- -----------------------------
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT categories_name_en_not_blank_chk
        CHECK (BTRIM(name_en) <> ''),
    CONSTRAINT categories_name_ar_not_blank_chk
        CHECK (BTRIM(name_ar) <> '')
);

-- Trimmed, case-insensitive uniqueness for both localized names.
CREATE UNIQUE INDEX categories_name_en_ci_uniq
    ON public.categories (LOWER(BTRIM(name_en)));

CREATE UNIQUE INDEX categories_name_ar_ci_uniq
    ON public.categories (LOWER(BTRIM(name_ar)));

-- -----------------------------
-- Authors
-- -----------------------------
CREATE TABLE public.authors (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    author_description_en TEXT,
    author_description_ar TEXT,
    email VARCHAR(320),
    phone_number VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT authors_name_en_not_blank_chk
        CHECK (BTRIM(name_en) <> ''),
    CONSTRAINT authors_name_ar_not_blank_chk
        CHECK (name_ar IS NULL OR BTRIM(name_ar) <> ''),
    CONSTRAINT authors_email_not_blank_chk
        CHECK (email IS NULL OR BTRIM(email) <> '')
);

CREATE UNIQUE INDEX authors_email_ci_uniq
    ON public.authors (LOWER(BTRIM(email)))
    WHERE email IS NOT NULL;

-- -----------------------------
-- Books
-- -----------------------------
CREATE TABLE public.books (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    weight_kg NUMERIC(6,2),
    barcode_image VARCHAR(500),
    category_id INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    shipping_cost NUMERIC(10,2),
    length_cm NUMERIC(6,2),
    width_cm NUMERIC(6,2),
    height_cm NUMERIC(6,2),
    cover_image VARCHAR(500),
    isbn TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT books_category_fk
        FOREIGN KEY (category_id)
        REFERENCES public.categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT books_name_en_not_blank_chk
        CHECK (BTRIM(name_en) <> ''),
    CONSTRAINT books_name_ar_not_blank_chk
        CHECK (BTRIM(name_ar) <> ''),
    CONSTRAINT books_isbn_not_blank_chk
        CHECK (BTRIM(isbn) <> ''),
    CONSTRAINT books_isbn_length_chk
        CHECK (LENGTH(BTRIM(isbn)) BETWEEN 13 AND 26),
    CONSTRAINT books_price_nonnegative_chk
        CHECK (price >= 0),
    CONSTRAINT books_shipping_cost_nonnegative_chk
        CHECK (shipping_cost IS NULL OR shipping_cost >= 0),
    CONSTRAINT books_weight_nonnegative_chk
        CHECK (weight_kg IS NULL OR weight_kg >= 0),
    CONSTRAINT books_length_nonnegative_chk
        CHECK (length_cm IS NULL OR length_cm >= 0),
    CONSTRAINT books_width_nonnegative_chk
        CHECK (width_cm IS NULL OR width_cm >= 0),
    CONSTRAINT books_height_nonnegative_chk
        CHECK (height_cm IS NULL OR height_cm >= 0)
);

CREATE UNIQUE INDEX books_isbn_normalized_uniq
    ON public.books (LOWER(BTRIM(isbn)));

CREATE INDEX books_category_id_idx
    ON public.books (category_id);

CREATE INDEX books_created_at_id_idx
    ON public.books (created_at DESC, id DESC);

-- -----------------------------
-- Book ↔ Author relationships
-- -----------------------------
CREATE TABLE public.book_authors (
    book_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,

    PRIMARY KEY (book_id, author_id),

    CONSTRAINT book_authors_book_fk
        FOREIGN KEY (book_id)
        REFERENCES public.books(id)
        ON DELETE CASCADE,

    CONSTRAINT book_authors_author_fk
        FOREIGN KEY (author_id)
        REFERENCES public.authors(id)
        ON DELETE CASCADE
);

CREATE INDEX book_authors_author_id_idx
    ON public.book_authors (author_id);

-- -----------------------------
-- updated_at triggers
-- -----------------------------
CREATE OR REPLACE FUNCTION public.set_catalog_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.set_catalog_updated_at();

CREATE TRIGGER trg_authors_set_updated_at
BEFORE UPDATE ON public.authors
FOR EACH ROW
EXECUTE FUNCTION public.set_catalog_updated_at();

CREATE TRIGGER trg_books_set_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.set_catalog_updated_at();

COMMIT;

-- ============================================================
-- OPTIONAL VERIFICATION (read-only)
-- ============================================================
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('categories', 'books', 'authors', 'book_authors')
-- ORDER BY table_name;
--
-- SELECT table_name, column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name IN ('categories', 'books', 'authors', 'book_authors')
-- ORDER BY table_name, ordinal_position;
--
-- SELECT
--   (SELECT COUNT(*) FROM public.categories) AS category_count,
--   (SELECT COUNT(*) FROM public.books) AS book_count,
--   (SELECT COUNT(*) FROM public.authors) AS author_count,
--   (SELECT COUNT(*) FROM public.book_authors) AS book_author_count;
