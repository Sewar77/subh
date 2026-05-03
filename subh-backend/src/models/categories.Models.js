import pool from "../config/db.js";

export const createCategory = async ({
  name_en,
  name_ar,
  description_en,
  description_ar,
  image,
}) => {
  const result = await pool.query(
    `INSERT INTO categories 
    (name_en, name_ar, description_en, description_ar, image)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [name_en, name_ar, description_en, description_ar, image],
  );

  return result.rows[0];
};

export const getAllCategories = async () => {
  const result = await pool.query(
    `SELECT * FROM categories ORDER BY created_at DESC`,
  );

  return result.rows;
};
