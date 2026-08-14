import pool from "../config/db.js";
import { hasSectionTemplate } from "../cms/sectionTemplateRegistry.js";

export const createSection = async (pageId, templateKey) => {
  if (!hasSectionTemplate(templateKey)) {
    const error = new Error("Section template is not registered");
    error.code = "CMS_TEMPLATE_UNKNOWN";
    throw error;
  }
  const positionResult = await pool.query(
    `
      SELECT COALESCE(MAX(position), 0) + 1 AS next_position
      FROM sections
      WHERE page_id = $1
    `,
    [pageId],
  );

  const nextPosition = positionResult.rows[0]?.next_position || 1;

  const result = await pool.query(
    `
      INSERT INTO sections (page_id, type, position, is_visible, is_archived)
      VALUES ($1, $2, $3, true, false)
      RETURNING id, page_id, type, position, is_visible, is_archived, created_at, updated_at
    `,
    [pageId, templateKey, nextPosition],
  );

  return result.rows[0] || null;
};

export const sectionExists = async (id) => {
  const result = await pool.query(
    `
      SELECT id
      FROM sections
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const lockSectionForUpdate = async (id, client) => {
  const result = await client.query(
    `
      SELECT id, page_id, type, position, is_visible, is_archived
      FROM sections
      WHERE id = $1
      FOR UPDATE
    `,
    [id],
  );
  return result.rows[0] || null;
};

export const listSectionsByPageId = async (pageId) => {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.page_id,
        s.type AS template_key,
        s.position,
        s.is_visible,
        s.is_archived,
        s.created_at,
        s.updated_at
      FROM sections s
      WHERE s.page_id = $1
      ORDER BY s.position ASC, s.id ASC
    `,
    [pageId],
  );

  return result.rows;
};

export const getSectionsByPage = listSectionsByPageId;

export const getPublicSectionsByPageId = async (pageId) => {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.page_id,
        s.type AS template_key,
        s.position,
        s.is_visible,
        s.is_archived,
        s.created_at,
        s.updated_at
      FROM sections s
      WHERE s.page_id = $1
        AND s.is_visible = true
        AND COALESCE(s.is_archived, false) = false
      ORDER BY s.position ASC, s.id ASC
    `,
    [pageId],
  );

  return result.rows;
};

export const getSectionById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.page_id,
        s.type AS template_key,
        s.position,
        s.is_visible,
        s.is_archived,
        s.created_at,
        s.updated_at,
        p.key AS page_key,
        p.name AS page_name,
        p.status AS page_status
      FROM sections s
      JOIN pages p ON p.id = s.page_id
      WHERE s.id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const getSectionForAdmin = async (id) => {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.page_id,
        s.type AS template_key,
        s.position,
        s.is_visible,
        s.is_archived,
        s.created_at,
        s.updated_at,
        p.key AS page_key,
        p.name AS page_name,
        p.status AS page_status
      FROM sections s
      JOIN pages p ON p.id = s.page_id
      WHERE s.id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const updateSectionPosition = async (id, position) => {
  const result = await pool.query(
    `
      UPDATE sections
      SET position = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, page_id, type, position, is_visible, is_archived, created_at, updated_at
    `,
    [id, position],
  );

  return result.rows[0] || null;
};

export const reorderPageSections = async (pageId, items = []) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const currentResult = await client.query(
      `
        SELECT id
        FROM sections
        WHERE page_id = $1
        ORDER BY id ASC
        FOR UPDATE
      `,
      [pageId],
    );
    const currentIds = currentResult.rows
      .map(({ id }) => Number(id))
      .sort((a, b) => a - b);
    const submittedIds = items
      .map(({ id }) => Number(id))
      .sort((a, b) => a - b);

    if (
      currentIds.length !== submittedIds.length ||
      currentIds.some((id, index) => id !== submittedIds[index])
    ) {
      const error = new Error("Reorder payload must include every page section");
      error.code = "CMS_SECTION_REORDER_MISMATCH";
      throw error;
    }

    for (const item of items) {
      await client.query(
        `
          UPDATE sections
          SET position = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND page_id = $3
        `,
        [item.id, item.position, pageId],
      );
    }

    const result = await client.query(
      `
        SELECT
          id,
          page_id,
          type AS template_key,
          position,
          is_visible,
          is_archived,
          created_at,
          updated_at
        FROM sections
        WHERE page_id = $1
        ORDER BY position ASC, id ASC
      `,
      [pageId],
    );
    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateSectionVisibility = async (id, isVisible) => {
  const result = await pool.query(
    `
      UPDATE sections
      SET is_visible = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, page_id, type, position, is_visible, is_archived, created_at, updated_at
    `,
    [id, isVisible],
  );

  return result.rows[0] || null;
};

export const toggleSectionVisibility = async (id) => {
  const result = await pool.query(
    `
      UPDATE sections
      SET is_visible = NOT is_visible,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, page_id, type, position, is_visible, is_archived, created_at, updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const archiveSection = async (id) => {
  const result = await pool.query(
    `
      UPDATE sections
      SET is_archived = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, page_id, type, position, is_visible, is_archived, created_at, updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const restoreSection = async (id) => {
  const result = await pool.query(
    `
      UPDATE sections
      SET is_archived = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, page_id, type, position, is_visible, is_archived, created_at, updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const updateSection = async (id, position, isVisible) => {
  const result = await pool.query(
    `
      UPDATE sections
      SET
        position = COALESCE($2, position),
        is_visible = COALESCE($3, is_visible),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, page_id, type, position, is_visible, is_archived, created_at, updated_at
    `,
    [id, position, isVisible],
  );

  return result.rows[0] || null;
};

export const deleteSection = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM sections
      WHERE id = $1
      RETURNING id, page_id, type, position, is_visible, is_archived, created_at, updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const getAllSections = async () => {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.page_id,
        s.type AS template_key,
        s.position,
        s.is_visible,
        s.is_archived,
        s.created_at,
        s.updated_at,
        p.key AS page_key,
        p.status AS page_status
      FROM sections s
      JOIN pages p ON p.id = s.page_id
      ORDER BY s.position ASC, s.id ASC
    `,
  );

  return result.rows;
};

export const getSectionsByPageKey = async (pageKey) => {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.page_id,
        s.type AS template_key,
        s.position,
        s.is_visible,
        s.is_archived,
        s.created_at,
        s.updated_at
      FROM sections s
      JOIN pages p ON p.id = s.page_id
      WHERE p.key = $1
      ORDER BY s.position ASC, s.id ASC
    `,
    [pageKey],
  );

  return result.rows;
};
