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
