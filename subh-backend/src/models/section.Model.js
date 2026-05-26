import pool from "../config/db.js";

/**
 * CREATE SECTION
 */
export const createSection = async (page_id, type, position) => {
  const result = await pool.query(
    `
    INSERT INTO sections (page_id, type, position)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [page_id, type, position],
  );

  return result.rows[0];
};

/**
 * GET ALL SECTIONS BY PAGE (FAST RENDER QUERY)
 */
export const getSectionsByPage = async (page_id) => {
  const result = await pool.query(
    `
    SELECT id, page_id, type, position, is_visible
    FROM sections
    WHERE page_id = $1 AND is_visible = true
    ORDER BY position ASC
    `,
    [page_id],
  );

  return result.rows;
};

/**
 * GET SECTION BY ID
 */
export const getSectionById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM sections
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

/**
 * UPDATE SECTION
 */
export const updateSection = async (id, type, position, is_visible) => {
  const result = await pool.query(
    `
    UPDATE sections
    SET
      type = COALESCE($2, type),
      position = COALESCE($3, position),
      is_visible = COALESCE($4, is_visible)
    WHERE id = $1
    RETURNING *
    `,
    [id, type, position, is_visible],
  );

  return result.rows[0];
};

/**
 * DELETE SECTION
 */
export const deleteSection = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM sections
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};
