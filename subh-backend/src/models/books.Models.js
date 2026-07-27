import pool from "../config/db.js";

const BOOK_COLUMNS = [
  "id",
  "name_en",
  "name_ar",
  "description_en",
  "description_ar",
  "weight_kg",
  "barcode_image",
  "category_id",
  "price",
  "shipping_cost",
  "length_cm",
  "width_cm",
  "height_cm",
  "created_at",
  "cover_image",
  "isbn",
].join(", ");

const normalizeISBN = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

const SORT_FIELDS = {
  createdAt: "created_at",
  price: "price",
  nameEn: "name_en",
  nameAr: "name_ar",
};

export const listBooks = async ({
  page = 1,
  limit = 20,
  search = "",
  categoryId,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const safePage =
    Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit =
    Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 20;
  const maxLimit = 100;
  const finalLimit = Math.min(safeLimit, maxLimit);
  const offset = (safePage - 1) * finalLimit;
  const safeSortBy = SORT_FIELDS[sortBy] || "created_at";
  const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";
  const safeSearch = normalizeText(search || "");

  const values = [];
  const filters = [];

  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    values.push(Number(categoryId));
    filters.push(`b.category_id = $${values.length}`);
  }

  if (safeSearch) {
    values.push(`%${safeSearch}%`);
    filters.push(
      `(LOWER(TRIM(b.name_en)) LIKE LOWER($${values.length}) OR LOWER(TRIM(b.name_ar)) LIKE LOWER($${values.length}))`,
    );
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*)::int AS total FROM books b ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = countResult.rows[0]?.total ?? 0;

  const query = `
    SELECT ${BOOK_COLUMNS}
    FROM books b
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeSortOrder}, b.id DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const result = await pool.query(query, [...values, finalLimit, offset]);

  return {
    books: result.rows,
    pagination: {
      page: safePage,
      limit: finalLimit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / finalLimit),
    },
  };
};

export const getBookById = async (bookId) => {
  const result = await pool.query(
    `SELECT ${BOOK_COLUMNS} FROM books WHERE id = $1`,
    [bookId],
  );

  return result.rows[0] || null;
};

export const getBookByIsbn = async (isbn) => {
  const normalizedIsbn = normalizeISBN(isbn);
  const result = await pool.query(
    `SELECT ${BOOK_COLUMNS} FROM books WHERE LOWER(TRIM(isbn)) = LOWER($1) LIMIT 1`,
    [normalizedIsbn],
  );

  return result.rows[0] || null;
};

export const findBookByNormalizedIsbn = async (isbn) => {
  return getBookByIsbn(isbn);
};

export const countBooks = async () => {
  const result = await pool.query(`SELECT COUNT(*)::int AS total FROM books`);
  return result.rows[0]?.total ?? 0;
};

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
    cover_image,
    isbn,
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
      height_cm,
      cover_image,
      isbn
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING ${BOOK_COLUMNS}`,
    [
      normalizeText(name_en),
      normalizeText(name_ar),
      normalizeText(description_en),
      normalizeText(description_ar),
      weight_kg,
      barcode_image,
      category_id,
      price,
      shipping_cost,
      length_cm,
      width_cm,
      height_cm,
      cover_image,
      normalizeISBN(isbn),
    ],
  );

  return result.rows[0] || null;
};

export const updateBook = async (bookId, payload = {}) => {
  const updates = [];
  const values = [bookId];
  let parameterIndex = 2;

  const allowedFields = {
    name_en: "name_en",
    name_ar: "name_ar",
    description_en: "description_en",
    description_ar: "description_ar",
    weight_kg: "weight_kg",
    barcode_image: "barcode_image",
    category_id: "category_id",
    price: "price",
    shipping_cost: "shipping_cost",
    length_cm: "length_cm",
    width_cm: "width_cm",
    height_cm: "height_cm",
    cover_image: "cover_image",
    isbn: "isbn",
  };

  for (const [key, value] of Object.entries(payload)) {
    if (
      !Object.prototype.hasOwnProperty.call(allowedFields, key) ||
      value === undefined
    ) {
      continue;
    }

    updates.push(`${allowedFields[key]} = $${parameterIndex}`);
    values.push(
      key === "isbn"
        ? normalizeISBN(value)
        : key === "name_en" ||
            key === "name_ar" ||
            key === "description_en" ||
            key === "description_ar"
          ? normalizeText(value)
          : value,
    );
    parameterIndex += 1;
  }

  if (updates.length === 0) {
    return null;
  }

  const result = await pool.query(
    `UPDATE books
     SET ${updates.join(", ")}
     WHERE id = $1
     RETURNING ${BOOK_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};

export const deleteBook = async (bookId) => {
  const result = await pool.query(
    `DELETE FROM books WHERE id = $1 RETURNING ${BOOK_COLUMNS}`,
    [bookId],
  );

  return result.rows[0] || null;
};

export const listBooksByCategory = async (categoryId) => {
  const result = await pool.query(
    `SELECT ${BOOK_COLUMNS} FROM books WHERE category_id = $1 ORDER BY created_at DESC, id DESC`,
    [categoryId],
  );

  return result.rows;
};

export const getBookWithCategory = async (bookId) => {
  const result = await pool.query(
    `SELECT b.${BOOK_COLUMNS.replaceAll(", ", ", b.")}
     FROM books b
     LEFT JOIN categories c ON c.id = b.category_id
     WHERE b.id = $1`,
    [bookId],
  );

  return result.rows[0] || null;
};

export const listAuthorsForBook = async (bookId) => {
  const result = await pool.query(
    `SELECT a.id, a.name_en, a.name_ar, a.author_description_en, a.author_description_ar, a.email, a.phone_number, a.created_at
     FROM book_authors ba
     JOIN authors a ON a.id = ba.author_id
     WHERE ba.book_id = $1
     ORDER BY a.id ASC`,
    [bookId],
  );

  return result.rows;
};

export const replaceBookAuthors = async (client, bookId, authorIds) => {
  const uniqueAuthorIds = [
    ...new Set(
      authorIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];

  await client.query(`DELETE FROM book_authors WHERE book_id = $1`, [bookId]);

  for (const authorId of uniqueAuthorIds) {
    await client.query(
      `INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)`,
      [bookId, authorId],
    );
  }
};

export const addAuthorToBook = async (client, bookId, authorId) => {
  await client.query(
    `INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)`,
    [bookId, authorId],
  );
};

export const removeAuthorFromBook = async (client, bookId, authorId) => {
  await client.query(
    `DELETE FROM book_authors WHERE book_id = $1 AND author_id = $2`,
    [bookId, authorId],
  );
};

export const getAuthorById = async (authorId) => {
  const result = await pool.query(
    `SELECT id, name_en, name_ar, author_description_en, author_description_ar, email, phone_number, created_at
     FROM authors WHERE id = $1`,
    [authorId],
  );

  return result.rows[0] || null;
};

export const getAuthorsByIds = async (authorIds = []) => {
  if (!Array.isArray(authorIds) || authorIds.length === 0) {
    return [];
  }

  const orderedIds = [
    ...new Set(
      authorIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];
  if (orderedIds.length === 0) {
    return [];
  }

  const placeholders = orderedIds.map((_, index) => `$${index + 1}`).join(", ");
  const result = await pool.query(
    `SELECT id, name_en, name_ar, author_description_en, author_description_ar, email, phone_number, created_at
     FROM authors
     WHERE id IN (${placeholders})
     ORDER BY id ASC`,
    orderedIds,
  );

  return result.rows;
};

export const findAuthorByName = async (client, name_en, name_ar) => {
  const result = await client.query(
    `SELECT id FROM authors WHERE LOWER(TRIM(name_en)) = LOWER($1) AND LOWER(TRIM(name_ar)) = LOWER($2) LIMIT 1`,
    [name_en, name_ar],
  );

  return result.rows[0] || null;
};

export const createAuthor = async (client, name_en, name_ar) => {
  const result = await client.query(
    `INSERT INTO authors (name_en, name_ar)
     VALUES ($1, $2)
     RETURNING id, name_en, name_ar, author_description_en, author_description_ar, email, phone_number, created_at`,
    [name_en, name_ar],
  );

  return result.rows[0] || null;
};

export const linkBookAuthor = async (client, book_id, author_id) => {
  await client.query(
    `INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)`,
    [book_id, author_id],
  );
};
