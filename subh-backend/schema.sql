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