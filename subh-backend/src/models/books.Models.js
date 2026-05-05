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
    barcode_image,
    category_id,
    price,
    shipping_cost,
    length_cm,
    width_cm,
    height_cm,
  } = data;

  const result = await client.query(
    `INSERT INTO books (
      name_en,
      name_ar,
      description_en,
      description_ar,
      weight_kg,
      barcode_image,
      category_id,
      price,
      shipping_cost,
      length_cm,
      width_cm,
      height_cm
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      name_en,
      name_ar,
      description_en,
      description_ar,
      weight_kg,
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
