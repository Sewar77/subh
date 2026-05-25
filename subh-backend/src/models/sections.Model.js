import pool from "../config/db.js";

export const createSection = async (pageId, type) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO sections (page_id, type, position)
      VALUES ($1, $2, (
        SELECT COALESCE(MAX(position), 0) + 1 FROM sections WHERE page_id = $1
      ))
      RETURNING *;
      `,
      [pageId, type],
    );

    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to create section");
  }
};

export const getAllSesctionsPage = async (pageId) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO sections (page_id, type, position)
      VALUES ($1, $2, (
        SELECT COALESCE(MAX(position), 0) + 1 FROM sections WHERE page_id = $1
      ))
      RETURNING *;
      `,
      [pageId],
    );

    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to create section");
  }
};
