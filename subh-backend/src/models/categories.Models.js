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

export const deleteCategory = async (catId) => {
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 RETURNING *`,
    [catId],
  );

  return result.rows[0];
};

export const updateCategory = async (catId, catData) => {
  const result = await pool.query(
    `UPDATE categories 
     SET name_en = $1,
         name_ar = $2,
         description_en = $3,
         description_ar = $4,
         image = $5
     WHERE id = $6
     RETURNING *`,
    [
      catData.name_en,
      catData.name_ar,
      catData.description_en,
      catData.description_ar,
      catData.image,
      catId,
    ],
  );

  return result.rows[0];
};
