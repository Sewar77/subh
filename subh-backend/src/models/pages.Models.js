import pool from "../config/db.js";

export const insertPage = async (key, userId) => {
  try {
    const result = await pool.query(
      `INSERT INTO pages (key, created_by, updated_by) VALUES ($1, $2 , $3) RETURNING *`,
      [key, userId, userId],
    );

    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Page key already exists");
    }

    throw new Error("Failed to create page");
  }
};

export const getAllPages = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        u1.name AS created_by_name,
        u2.name AS updated_by_name
      FROM pages p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
    `);

    return result.rows;
  } catch (error) {
    throw new Error("Failed to get pages");
  }
};
export const getPageByKey = async (key) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        p.*,
        u1.name AS created_by_name,
        u2.name AS updated_by_name
      FROM pages p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      WHERE p.key = $1
      `,
      [key],
    );

    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to get page by key");
  }
};

export const getPageById = async (id) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        p.*,
        u1.name AS created_by_name,
        u2.name AS updated_by_name
      FROM pages p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      WHERE p.id = $1
      `,
      [id],
    );

    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to get page by id");
  }
};
