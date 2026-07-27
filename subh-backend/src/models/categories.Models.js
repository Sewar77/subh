import pool from "../config/db.js";

const CATEGORY_COLUMNS = [
  "id",
  "name_en",
  "name_ar",
  "description_en",
  "description_ar",
  "image",
  "created_at",
].join(", ");

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

export const listCategories = async () => {
  const result = await pool.query(
    `SELECT ${CATEGORY_COLUMNS} FROM categories ORDER BY created_at DESC, id DESC`,
  );

  return result.rows;
};

export const getCategoryById = async (categoryId) => {
  const result = await pool.query(
    `SELECT ${CATEGORY_COLUMNS} FROM categories WHERE id = $1`,
    [categoryId],
  );

  return result.rows[0] || null;
};

export const findCategoryByEnglishName = async (nameEn) => {
  const normalizedName = normalizeText(nameEn);
  const result = await pool.query(
    `SELECT ${CATEGORY_COLUMNS} FROM categories WHERE LOWER(TRIM(name_en)) = LOWER($1) LIMIT 1`,
    [normalizedName],
  );

  return result.rows[0] || null;
};

export const findCategoryByArabicName = async (nameAr) => {
  const normalizedName = normalizeText(nameAr);
  const result = await pool.query(
    `SELECT ${CATEGORY_COLUMNS} FROM categories WHERE LOWER(TRIM(name_ar)) = LOWER($1) LIMIT 1`,
    [normalizedName],
  );

  return result.rows[0] || null;
};

export const createCategory = async ({
  name_en,
  name_ar,
  description_en,
  description_ar,
  image,
}) => {
  const result = await pool.query(
    `INSERT INTO categories (
      name_en,
      name_ar,
      description_en,
      description_ar,
      image
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING ${CATEGORY_COLUMNS}`,
    [name_en, name_ar, description_en, description_ar, image],
  );

  return result.rows[0] || null;
};

export const updateCategory = async (categoryId, payload = {}) => {
  const updates = [];
  const values = [categoryId];
  let parameterIndex = 2;

  const allowedFields = {
    name_en: "name_en",
    name_ar: "name_ar",
    description_en: "description_en",
    description_ar: "description_ar",
    image: "image",
  };

  for (const [key, value] of Object.entries(payload)) {
    if (
      !Object.prototype.hasOwnProperty.call(allowedFields, key) ||
      value === undefined
    ) {
      continue;
    }

    updates.push(`${allowedFields[key]} = $${parameterIndex}`);
    values.push(value);
    parameterIndex += 1;
  }

  if (updates.length === 0) {
    return null;
  }

  const result = await pool.query(
    `UPDATE categories
     SET ${updates.join(", ")}
     WHERE id = $1
     RETURNING ${CATEGORY_COLUMNS}`,
    values,
  );

  return result.rows[0] || null;
};

export const deleteCategory = async (categoryId) => {
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 RETURNING ${CATEGORY_COLUMNS}`,
    [categoryId],
  );

  return result.rows[0] || null;
};

export const countBooksInCategory = async (categoryId) => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS book_count FROM books WHERE category_id = $1`,
    [categoryId],
  );

  return result.rows[0]?.book_count ?? 0;
};

export const categoryExists = async (categoryId) => {
  const result = await pool.query(
    `SELECT 1 FROM categories WHERE id = $1 LIMIT 1`,
    [categoryId],
  );

  return result.rowCount > 0;
};
