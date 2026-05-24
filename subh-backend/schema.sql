create table categories (
    id serial primary key, 

    name text unique not null, 

    description text, 

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    image text
)

CREATE TABLE books (
    id SERIAL PRIMARY KEY,

    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),

    description_en TEXT,
    description_ar TEXT,

    weight_kg DECIMAL(6,2),

    barcode_image VARCHAR(500),

    category_id INT,

    price DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2),

    length_cm DECIMAL(6,2),

    width_cm DECIMAL(6,2),

    height_cm DECIMAL(6,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL
);

ALTER TABLE books
ADD COLUMN cover_image VARCHAR(500);

ALTER TABLE books 
ADD COLUMN isbn TEXT UNIQUE 
CHECK (LENGTH(isbn) >= 13 AND LENGTH(isbn) <= 26);   

ALTER TABLE books 
ALTER COLUMN isbn SET NOT NULL;   

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,

    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),

    author_description_en TEXT,
    author_description_ar TEXT,

    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_authors (
    book_id INT,
    author_id INT,

    PRIMARY KEY (book_id, author_id),

    FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE CASCADE,

    FOREIGN KEY (author_id) REFERENCES authors(id)
        ON DELETE CASCADE
);

CREATE TABLE workshops (
    id SERIAL PRIMARY KEY,

    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),

    gender VARCHAR(10) DEFAULT 'both'
    CHECK (gender IN ('male', 'female', 'both')),

    min_age INT,
    max_age INT,

    start_time TIME NOT NULL,

    workshop_date DATE NOT NULL,

    trainer_name_en VARCHAR(255) NOT NULL,
    trainer_name_ar VARCHAR(255),

    description_en TEXT NOT NULL,
    description_ar TEXT,

    duration_h INT NOT NULL,

    price NUMERIC(10,2)
    CHECK (price IS NULL OR price >= 0),

    trainer_description_en TEXT,
    trainer_description_ar TEXT,

    is_online BOOLEAN DEFAULT FALSE,

    meeting_link TEXT,
    location_googlemap_link TEXT,

    is_user_paid BOOLEAN DEFAULT FALSE,

    is_free BOOLEAN DEFAULT FALSE,

    status VARCHAR(20)
    DEFAULT 'available'
    CHECK (status IN ('available', 'not_available')),

    image TEXT NOT NULL,

    seats_number INT NOT NULL
    CHECK (seats_number > 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- AGE VALIDATION
    CONSTRAINT age_range_check
    CHECK (
        (min_age IS NULL AND max_age IS NULL)
        OR
        (min_age >= 0 AND max_age >= min_age)
    ),

    -- ONLINE / OFFLINE RULE
    CONSTRAINT online_offline_check
    CHECK (
        (
            is_online = TRUE
            AND meeting_link IS NOT NULL
            AND location_googlemap_link IS NULL
        )
        OR
        (
            is_online = FALSE
            AND location_googlemap_link IS NOT NULL
            AND meeting_link IS NULL
        )
    ),

    -- FREE WORKSHOP RULE
    CONSTRAINT free_price_check
    CHECK (
        (is_free = TRUE AND price IS NULL)
        OR
        (is_free = FALSE)
    )
);


select * from workshops

-- =========================
-- DROP TABLES (SAFE ORDER)
-- =========================

DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS contact_page CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS page_sections CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS pages CASCADE;

-- =========================
-- PAGES
-- =========================

CREATE TABLE pages (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,

    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,

    seo_title_en VARCHAR(255),
    seo_title_ar VARCHAR(255),

    seo_description_en TEXT,
    seo_description_ar TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- MEDIA
-- =========================

CREATE TABLE media (
    id BIGSERIAL PRIMARY KEY,
    url TEXT NOT NULL,

    public_id VARCHAR(255),
    type VARCHAR(50),
    format VARCHAR(50),
    mime_type TEXT,

    size_kb INTEGER,
    width INTEGER,
    height INTEGER,

    folder VARCHAR(100),
    alt_text VARCHAR(255),

    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PAGE SECTIONS
-- =========================

CREATE TABLE page_sections (
    id BIGSERIAL PRIMARY KEY,
    page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

    type VARCHAR(100) NOT NULL,

    title_en VARCHAR(255),
    title_ar VARCHAR(255),

    content_en TEXT,
    content_ar TEXT,

    media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,

    order_number INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,

    settings_json JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- NEWS
-- =========================

CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,

    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,

    slug VARCHAR(255) UNIQUE NOT NULL,

    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,

    media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,

    published BOOLEAN DEFAULT FALSE,

    seo_title_en VARCHAR(255),
    seo_title_ar VARCHAR(255),

    seo_description_en TEXT,
    seo_description_ar TEXT,

    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CONTACT PAGE
-- =========================

CREATE TABLE contact_page (
    id BIGSERIAL PRIMARY KEY,

    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,

    image_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CONTACT SUBMISSIONS
-- =========================

CREATE TABLE contact_submissions (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),

    message TEXT NOT NULL,

    status VARCHAR(50) DEFAULT 'new',
    message_language VARCHAR(10) DEFAULT 'en',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INSERT DEFAULT PAGES
-- =========================

INSERT INTO pages (slug, title_en, title_ar)
VALUES
('about', 'About Us', 'من نحن'),
('contact', 'Contact Us', 'اتصل بنا');

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_page_sections_page_id
ON page_sections(page_id);

CREATE INDEX idx_news_slug
ON news(slug);

CREATE INDEX idx_pages_slug
ON pages(slug);

CREATE INDEX idx_contact_submissions_status
ON contact_submissions(status);




-- new version
-- DROP TABLE IF EXISTS contact_submissions CASCADE;
-- DROP TABLE IF EXISTS contact_page CASCADE;
-- DROP TABLE IF EXISTS news CASCADE;
-- DROP TABLE IF EXISTS page_sections CASCADE;
-- DROP TABLE IF EXISTS media CASCADE;
-- DROP TABLE IF EXISTS pages CASCADE;

-- CREATE TABLE media (
--     id BIGSERIAL PRIMARY KEY,
--     url TEXT NOT NULL,

--     public_id VARCHAR(255),
--     type VARCHAR(50),
--     format VARCHAR(50),
--     mime_type TEXT,

--     size_kb INTEGER,
--     width INTEGER,
--     height INTEGER,

--     folder VARCHAR(100),
--     alt_text VARCHAR(255),

--     uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,

--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- PAGES
CREATE TABLE pages (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(150) UNIQUE NOT NULL,        -- internal key e.g. "about", "home"
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  default_locale CHAR(2) NOT NULL DEFAULT 'en',
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PAGE TRANSLATIONS (one row per locale)
CREATE TABLE page_translations (
  id BIGSERIAL PRIMARY KEY,
  page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  locale CHAR(2) NOT NULL,
  title TEXT,
  slug VARCHAR(255),
  seo_title TEXT,
  seo_description TEXT,
  content JSONB,                            -- optional structured content for whole page
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (page_id, locale)
);

-- SECTIONS (ordered building blocks of a page)
CREATE TABLE sections (
  id BIGSERIAL PRIMARY KEY,
  page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,               -- e.g., hero, text_block, gallery, form
  position INTEGER NOT NULL DEFAULT 0,      -- ordering within page
  settings JSONB DEFAULT '{}'::jsonb,       -- layout/settings common to all locales
  is_visible BOOLEAN DEFAULT TRUE,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SECTION TRANSLATIONS (locale specific content)
CREATE TABLE section_translations (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  locale CHAR(2) NOT NULL,
  title TEXT,
  content JSONB,                            -- structured content: blocks, rich text, lists
  is_visible BOOLEAN DEFAULT TRUE,          -- per-locale visibility
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (section_id, locale)
);

-- -- MEDIA store metadata only; actual files in S3/CDN
-- CREATE TABLE media (
--   id BIGSERIAL PRIMARY KEY,
--   provider VARCHAR(50),                      -- e.g., s3, cloudinary
--   public_id VARCHAR(255),                    -- provider id
--   url TEXT NOT NULL,
--   type VARCHAR(50),                          -- image, video, file
--   mime_type VARCHAR(100),
--   format VARCHAR(50),
--   size_bytes BIGINT,
--   width INTEGER,
--   height INTEGER,
--   metadata JSONB DEFAULT '{}'::jsonb,        -- variants, thumbnails, focal point
--   uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- RELATION between sections and media (supports multiple media per section)
CREATE TABLE section_media (
  section_id BIGINT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'attachment',     -- hero, gallery_item, thumbnail, file
  position INTEGER DEFAULT 0,
  alt_text JSONB DEFAULT '{}'::jsonb,       -- { "en":"", "ar":"" }
  PRIMARY KEY (section_id, media_id)
);

-- NEWS / BLOG as content type (re-uses media and translations pattern)
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(150) UNIQUE,
  status VARCHAR(30) DEFAULT 'draft',
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_translations (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  locale CHAR(2) NOT NULL,
  title TEXT,
  slug VARCHAR(255),
  excerpt TEXT,
  body JSONB,
  seo_title TEXT,
  seo_description TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  UNIQUE (post_id, locale)
);

CREATE TABLE post_media (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'cover',
  position INTEGER DEFAULT 0,
  PRIMARY KEY (post_id, media_id)
);

-- CONTACT PAGE configuration (single row per site or per locale)
CREATE TABLE contact_pages (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_page_translations (
  id BIGSERIAL PRIMARY KEY,
  contact_page_id BIGINT NOT NULL REFERENCES contact_pages(id) ON DELETE CASCADE,
  locale CHAR(2) NOT NULL,
  title TEXT,
  description TEXT,
  image_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,
  form_settings JSONB DEFAULT '{}'::jsonb,
  UNIQUE (contact_page_id, locale)
);

-- CONTACT SUBMISSIONS
CREATE TABLE contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  contact_page_id BIGINT REFERENCES contact_pages(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  message_locale CHAR(2) DEFAULT 'en',
  status VARCHAR(50) DEFAULT 'new',
  assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT / VERSIONING for pages and sections (simple append-only)
CREATE TABLE content_versions (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,          -- page, section, post
  entity_id BIGINT NOT NULL,
  locale CHAR(2),
  data JSONB NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEARCH helper columns (optional denormalized tsvector per locale)
ALTER TABLE page_translations ADD COLUMN tsv tsvector;
ALTER TABLE post_translations ADD COLUMN tsv tsvector;
ALTER TABLE section_translations ADD COLUMN tsv tsvector;

