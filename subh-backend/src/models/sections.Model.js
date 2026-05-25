import pool from "../config/db.js";

export const createSection = async (pageId, type, settings = {}) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO sections (page_id, type, position, settings)
      VALUES (
        $1,
        $2,
        (SELECT COALESCE(MAX(position), 0) + 1 FROM sections WHERE page_id = $1),
        $3
      )
      RETURNING *;
      `,
      [pageId, type, settings],
    );

    return result.rows[0];
  } catch (error) {
    throw new Error("Failed to create section");
  }
};

export const getAllSectionsByPage = async (pageId) => {
  try {
    const result = await pool.query(
      `
      select * from sections where page_id=$1 ORDER BY position ASC;
      `,
      [pageId],
    );

    return result.rows;
  } catch (error) {
    throw new Error("Failed to create section");
  }
};

export const deleteSection = async (sectionId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const sectionRes = await client.query(
      "SELECT * FROM sections WHERE id = $1",
      [sectionId],
    );
    const section = sectionRes.rows[0];
    if (!section) {
      throw new Error("Section not found");
    }
    const { page_id, position } = section;
    await client.query("DELETE FROM sections WHERE id = $1", [sectionId]);
    await client.query(
      `
      UPDATE sections
      SET position = position - 1
      WHERE page_id = $1 AND position > $2
      `,
      [page_id, position],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error("Failed to delete section");
  } finally {
    client.release();
  }
};

export const updateSection = async (id, data) => {
  const client = await pool.connect();
  try {
    const { type, settings, is_visible, userId } = data;
    const result = await client.query(
      `
      UPDATE sections
      SET
        type = COALESCE($1, type),
        settings = COALESCE($2, settings),
        is_visible = COALESCE($3, is_visible),
        updated_by = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *;
      `,
      [type, settings, is_visible, userId, id],
    );

    return result.rows[0];
  } finally {
    client.release();
  }
};

export const getSectionById = async (id) => {
  try {
    const result = await pool.query(`select * from sections where id = $1`, [
      id,
    ]);
    return result.rows[0];
  } catch (error) {}
};
