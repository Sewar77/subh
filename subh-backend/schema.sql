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
-- PAGE TEMPLATES
-- =========================

CREATE TABLE page_templates (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PAGES
-- =========================

CREATE TABLE pages (
  id BIGSERIAL PRIMARY KEY,
  template_id BIGINT NOT NULL REFERENCES page_templates(id) ON DELETE RESTRICT,
  key VARCHAR(150) UNIQUE NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PAGE TRANSLATIONS
-- =========================

CREATE TABLE page_translations (
  id BIGSERIAL PRIMARY KEY,
  page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  locale CHAR(2) NOT NULL,
  title TEXT,
  slug VARCHAR(255),
  seo_title TEXT,
  seo_description TEXT,
  UNIQUE(page_id, locale)
);

-- =========================
-- SECTIONS
-- =========================

CREATE TABLE sections (
  id BIGSERIAL PRIMARY KEY,
  page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- SECTION TRANSLATIONS
-- =========================

CREATE TABLE section_translations (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  locale CHAR(2) NOT NULL,
  title TEXT,
  content JSONB NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  UNIQUE(section_id, locale)
);

-- =========================
-- SECTION MEDIA
-- =========================

CREATE TABLE section_media (
  section_id BIGINT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'image',
  position INT DEFAULT 0,
  PRIMARY KEY(section_id, media_id)
);

-- =========================
-- POSTS (NEWS)
-- =========================

CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(150) UNIQUE,
  status VARCHAR(30) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_translations (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  locale CHAR(2) NOT NULL,
  title TEXT,
  slug VARCHAR(255),
  excerpt TEXT,
  body JSONB,
  seo_title TEXT,
  seo_description TEXT,
  UNIQUE(post_id, locale)
);

CREATE TABLE post_media (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  media_id BIGINT REFERENCES media(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'cover',
  position INT DEFAULT 0,
  PRIMARY KEY(post_id, media_id)
);

-- =========================
-- CONTACT SYSTEM
-- =========================

CREATE TABLE contact_pages (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_page_translations (
  id BIGSERIAL PRIMARY KEY,
  contact_page_id BIGINT REFERENCES contact_pages(id) ON DELETE CASCADE,
  locale CHAR(2) NOT NULL,
  title TEXT,
  description TEXT,
  form_settings JSONB DEFAULT '{}'::jsonb,
  UNIQUE(contact_page_id, locale)
);

CREATE TABLE contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  contact_page_id BIGINT REFERENCES contact_pages(id) ON DELETE SET NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TEMPLATE CONSTRAINTS (OPTIONAL RULE LAYER)
-- =========================

CREATE TABLE template_sections (
  id BIGSERIAL PRIMARY KEY,
  template_id BIGINT REFERENCES page_templates(id) ON DELETE CASCADE,
  section_type VARCHAR(100),
  is_required BOOLEAN DEFAULT FALSE,
  max_count INT DEFAULT 1
);

-- =========================
-- AUDIT LOG
-- =========================

CREATE TABLE content_versions (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  locale CHAR(2),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_sections_page_position
ON sections(page_id, position);

-- SELECT * FROM page_templates 
-- select * from page_translations

-- =========================
-- PAGE TEMPLATES
-- =========================
CREATE INDEX idx_page_templates_key
ON page_templates(key);

-- =========================
-- PAGES
-- =========================
CREATE INDEX idx_pages_template_id
ON pages(template_id);

CREATE INDEX idx_pages_key
ON pages(key);

CREATE INDEX idx_pages_status
ON pages(status);

-- =========================
-- PAGE TRANSLATIONS
-- =========================
CREATE INDEX idx_page_trans_page_id
ON page_translations(page_id);

CREATE INDEX idx_page_trans_locale
ON page_translations(locale);

CREATE INDEX idx_page_trans_page_locale
ON page_translations(page_id, locale);

CREATE INDEX idx_page_trans_slug
ON page_translations(slug);

-- =========================
-- SECTIONS
-- =========================
CREATE INDEX idx_sections_page_id
ON sections(page_id);

CREATE INDEX idx_sections_page_position
ON sections(page_id, position);

CREATE INDEX idx_sections_visibility
ON sections(is_visible);

-- =========================
-- SECTION TRANSLATIONS
-- =========================
CREATE INDEX idx_section_trans_section_id
ON section_translations(section_id);

CREATE INDEX idx_section_trans_locale
ON section_translations(locale);

CREATE INDEX idx_section_trans_section_locale
ON section_translations(section_id, locale);

-- =========================
-- SECTION MEDIA
-- =========================
CREATE INDEX idx_section_media_section_id
ON section_media(section_id);

CREATE INDEX idx_section_media_media_id
ON section_media(media_id);

-- =========================
-- POSTS (NEWS)
-- =========================
CREATE INDEX idx_posts_key
ON posts(key);

CREATE INDEX idx_posts_status
ON posts(status);

CREATE INDEX idx_posts_created_at
ON posts(created_at);

-- =========================
-- POST TRANSLATIONS
-- =========================
CREATE INDEX idx_post_trans_post_id
ON post_translations(post_id);

CREATE INDEX idx_post_trans_locale
ON post_translations(locale);

CREATE INDEX idx_post_trans_post_locale
ON post_translations(post_id, locale);

CREATE INDEX idx_post_trans_slug
ON post_translations(slug);

-- =========================
-- CONTACT SYSTEM
-- =========================
CREATE INDEX idx_contact_pages_key
ON contact_pages(key);

CREATE INDEX idx_contact_submissions_status
ON contact_submissions(status);

CREATE INDEX idx_contact_submissions_created_at
ON contact_submissions(created_at);

-- =========================
-- TEMPLATE SECTIONS
-- =========================
CREATE INDEX idx_template_sections_template_id
ON template_sections(template_id);

-- =========================
-- CONTENT VERSIONING (AUDIT LOG)
-- =========================
CREATE INDEX idx_content_versions_entity
ON content_versions(entity_type, entity_id);

CREATE INDEX idx_content_versions_locale
ON content_versions(locale);

CREATE INDEX idx_content_versions_created_at
ON content_versions(created_at);