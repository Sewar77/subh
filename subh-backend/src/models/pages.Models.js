import pool from "../config/db.js";

export const createPage = async (key, name, status = "draft") => {
  const result = await pool.query(
    `
      INSERT INTO pages (key, name, status)
      VALUES ($1, $2, $3)
      RETURNING id, key, name, status, created_at, updated_at
    `,
    [key, name, status],
  );

  return result.rows[0] || null;
};

export const listFixedPages = async () => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.key,
        p.name,
        p.status,
        p.created_at,
        p.updated_at
      FROM pages p
      ORDER BY p.id ASC
    `,
  );

  return result.rows;
};

export const getAllPages = listFixedPages;

export const getPageById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.key,
        p.name,
        p.status,
        p.created_at,
        p.updated_at
      FROM pages p
      WHERE p.id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const getPageByKey = async (key) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.key,
        p.name,
        p.status,
        p.created_at,
        p.updated_at
      FROM pages p
      WHERE p.key = $1
    `,
    [key],
  );

  return result.rows[0] || null;
};

export const getPageBySlug = async (slug) => {
  return getPageByKey(slug);
};

export const getPublicPageByKey = async (key) => {
  const page = await getPageByKey(key);

  if (!page || page.status !== "published") {
    return null;
  }

  const sectionsResult = await pool.query(
    `
      SELECT
        s.id,
        s.page_id,
        s.type AS template_key,
        s.position,
        s.is_visible,
        s.created_at,
        s.updated_at
      FROM sections s
      WHERE s.page_id = $1
        AND s.is_visible = true
        AND COALESCE(s.is_archived, false) = false
      ORDER BY s.position ASC, s.id ASC
    `,
    [page.id],
  );

  return {
    page,
    sections: sectionsResult.rows,
  };
};

export const getAdminPageById = async (id) => {
  const page = await getPageById(id);

  if (!page) {
    return null;
  }

  const sectionsResult = await pool.query(
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
    [id],
  );

  return {
    page,
    sections: sectionsResult.rows,
  };
};

export const deletePage = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM pages
      WHERE id = $1
      RETURNING id, key, name, status, created_at, updated_at
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const updatePage = async (
  id,
  key = null,
  status = null,
  name = null,
) => {
  const result = await pool.query(
    `
      UPDATE pages
      SET
        key = COALESCE($2, key),
        name = COALESCE($4, name),
        status = COALESCE($3, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, key, name, status, created_at, updated_at
    `,
    [id, key, status, name],
  );

  return result.rows[0] || null;
};

export const updateEditablePageMetadata = async (id, metadata = {}) => {
  const result = await pool.query(
    `
      UPDATE pages
      SET
        name = COALESCE($2, name),
        status = COALESCE($3, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, key, name, status, created_at, updated_at
    `,
    [id, metadata.name || null, metadata.status || null],
  );

  return result.rows[0] || null;
};

export const getPageByKeyModel = async (key) => {
  return getPageByKey(key);
};
