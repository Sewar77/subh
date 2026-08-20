import pool from "../config/db.js";

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

export const lockSectionWithPageForUpdate = async (id, client) => {
  const result = await client.query(
    `
      SELECT
        s.id,
        s.page_id,
        s.type AS template_key,
        s.position,
        s.is_visible,
        s.is_archived,
        p.key AS page_key,
        p.name AS page_name,
        p.status AS page_status
      FROM sections s
      JOIN pages p ON p.id = s.page_id
      WHERE s.id = $1
      FOR UPDATE OF s, p
    `,
    [id],
  );
  return result.rows[0] || null;
};

export const lockPageForSectionManagement = async (pageId, client) => {
  const result = await client.query(
    `
      SELECT id, key, name, status, created_at, updated_at
      FROM pages
      WHERE id = $1
      FOR UPDATE
    `,
    [pageId],
  );
  return result.rows[0] || null;
};

export const listPageSectionsForUpdate = async (pageId, client) => {
  const result = await client.query(
    `
      SELECT id, page_id, type AS template_key, position, is_visible, is_archived
      FROM sections
      WHERE page_id = $1
      ORDER BY position ASC, id ASC
      FOR UPDATE
    `,
    [pageId],
  );
  return result.rows;
};

export const insertSectionInstanceRecord = async (
  { pageId, templateKey, position, isVisible = false },
  client,
) => {
  const result = await client.query(
    `
      INSERT INTO sections (page_id, type, position, is_visible, is_archived)
      VALUES ($1, $2, $3, $4, false)
      RETURNING id, page_id, type AS template_key, position, is_visible, is_archived, created_at, updated_at
    `,
    [pageId, templateKey, position, isVisible],
  );
  return result.rows[0] || null;
};

export const setContiguousSectionPositions = async (
  pageId,
  orderedSectionIds,
  client,
) => {
  for (const [position, id] of orderedSectionIds.entries()) {
    const result = await client.query(
      `
        UPDATE sections
        SET position = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND page_id = $2
      `,
      [id, pageId, position],
    );
    if (result.rowCount !== 1) {
      const error = new Error("Section ordering changed during the operation");
      error.code = "CMS_SECTION_REORDER_MISMATCH";
      throw error;
    }
  }
};

export const copySectionContentRecords = async (sourceId, targetId, client) => {
  await client.query(
    `
      INSERT INTO section_content (
        section_id, locale, field_key, field_value, field_type
      )
      SELECT $2, locale, field_key, field_value, field_type
      FROM section_content
      WHERE section_id = $1
    `,
    [sourceId, targetId],
  );
};

export const copySectionMediaReferences = async (sourceId, targetId, client) => {
  await client.query(
    `
      INSERT INTO section_media_items (
        section_id, slot_key, media_type, file_ref, position,
        alt_en, alt_ar, caption_en, caption_ar
      )
      SELECT $2, slot_key, media_type, file_ref, position,
        alt_en, alt_ar, caption_en, caption_ar
      FROM section_media_items
      WHERE section_id = $1
    `,
    [sourceId, targetId],
  );
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
