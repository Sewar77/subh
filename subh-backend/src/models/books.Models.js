import pool from "../config/db.js";

/* =========================
   BOOK OPERATIONS
========================= */

export const createBook = async (client, data) => {
  const {
    name_en,
    name_ar,
    description_en,
    description_ar,
    weight_kg,
    cover_image,
    barcode_image,
    category_id,
    price,
    shipping_cost,
    length_cm,
    width_cm,
    height_cm,
  } = data;

  const result = await client.query(
    `
    INSERT INTO books (
      name_en,
      name_ar,
      description_en,
      description_ar,
      weight_kg,
      cover_image,
      barcode_image,
      category_id,
      price,
      shipping_cost,
      length_cm,
      width_cm,
      height_cm
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
    )
    RETURNING *
    `,
    [
      name_en,
      name_ar,
      description_en,
      description_ar,
      weight_kg,
      cover_image,
      barcode_image,
      category_id,
      price,
      shipping_cost,
      length_cm,
      width_cm,
      height_cm,
    ],
  );

  return result.rows[0];
};

/* =========================
   AUTHOR OPERATIONS
========================= */

export const findAuthorByName = async (client, name_en, name_ar) => {
  const result = await client.query(
    `SELECT id FROM authors WHERE name_en = $1 AND name_ar = $2 LIMIT 1`,
    [name_en, name_ar],
  );
  return result.rows[0];
};

export const createAuthor = async (client, name_en, name_ar) => {
  const result = await client.query(
    `INSERT INTO authors (name_en, name_ar)
     VALUES ($1, $2)
     RETURNING id`,
    [name_en, name_ar],
  );

  return result.rows[0];
};

/* =========================
   RELATIONSHIP TABLE
========================= */

export const linkBookAuthor = async (client, book_id, author_id) => {
  await client.query(
    `INSERT INTO book_authors (book_id, author_id)
     VALUES ($1, $2)`,
    [book_id, author_id],
  );
};

/* =========================
   READ OPERATIONS (NO CLIENT NEEDED)
========================= */

export const getAllBooks = async () => {
  const result = await pool.query(`
    SELECT 
      b.id,
      b.name_en,
      b.name_ar,
      b.description_en,
      b.description_ar,
      b.barcode_image,
      b.cover_image,
      b.price,
      b.created_at,

      c.name_en AS category_name_en,
      c.name_ar AS category_name_ar,

      a.name_en AS author_name_en,
      a.name_ar AS author_name_ar

    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN book_authors ba ON b.id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.id

    ORDER BY b.id DESC
  `);

  return result.rows;
};

export const deleteBook = async (bookId) => {
  await pool.query(`delete from books where id = $1`, [bookId]);
};

export const getBookById = async (bookId) => {
  const result = await pool.query(
    ` SELECT 
      b.id,
      b.name_en,
      b.name_ar,
      b.description_en,
      b.description_ar,
      b.barcode_image,
      b.cover_image,
      b.price,
      b.length_cm,
      b.width_cm,
      b.height_cm,
      b.weight_kg,
      b.shipping_cost,
      b.created_at,

      c.name_en AS category_name_en,
      c.name_ar AS category_name_ar,

      a.name_en AS author_name_en,
      a.name_ar AS author_name_ar

    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN book_authors ba ON b.id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.id
    where b.id = $1
    ORDER BY b.id DESC`,
    [bookId],
  );

  return result.rows[0];
};

export const updateBookById = async (bookData, bookId) => {
  const result = await pool.query(
    `
    UPDATE books 
    SET
      name_en = $1,
      name_ar = $2,
      description_en = $3,
      description_ar = $4,
      weight_kg = $5,
      cover_image = $6,
      barcode_image = $7,
      category_id = $8,
      price = $9,
      shipping_cost = $10,
      length_cm = $11,
      width_cm = $12,
      height_cm = $13
    WHERE id = $14
    RETURNING *
    `,
    [
      bookData.name_en,
      bookData.name_ar,
      bookData.description_en,
      bookData.description_ar,
      bookData.weight_kg,
      bookData.cover_image,
      bookData.barcode_image,
      bookData.category_id,
      bookData.price,
      bookData.shipping_cost,
      bookData.length_cm,
      bookData.width_cm,
      bookData.height_cm,
      bookId,
    ],
  );

  return result.rows[0];
};
