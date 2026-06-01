import pool from "../config/db.js";

/**
 * CREATE PAGE TRANSLATION
 */
export const createPageTranslation = async (
  page_id,
  locale,
  title,
  slug,
  seo_title,
  seo_description,
) => {
  const result = await pool.query(
    `
    INSERT INTO page_translations
      (page_id, locale, title, slug, seo_title, seo_description)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [page_id, locale, title, slug, seo_title, seo_description],
  );

  return result.rows[0];
};

/**
 * GET ALL TRANSLATIONS (WITH PAGE INFO)
 */
export const getAllPageTranslations = async () => {
  const result = await pool.query(`
    SELECT 
      pt.*,
      p.key AS page_key,
      p.template_id
    FROM page_translations pt
    JOIN pages p ON pt.page_id = p.id
    ORDER BY pt.id DESC
  `);

  return result.rows;
};

/**
 * GET TRANSLATION BY ID (WITH PAGE + TEMPLATE)
 */
export const getPageTranslationById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      pt.*,
      p.key AS page_key,
      p.template_id,
      t.key AS template_key,
      t.name AS template_name
    FROM page_translations pt
    JOIN pages p ON pt.page_id = p.id
    JOIN page_templates t ON p.template_id = t.id
    WHERE p.id = $1
    `,
    [id],
  );
  return result.rows;
};

/**
 * GET TRANSLATION BY PAGE + LOCALE (MOST IMPORTANT FOR CMS RENDERING)
 */
export const getPageTranslation = async (page_id, locale) => {
  const result = await pool.query(
    `
    SELECT 
      pt.*,
      p.key AS page_key,
      t.key AS template_key
    FROM page_translations pt
    JOIN pages p ON pt.page_id = p.id
    JOIN page_templates t ON p.template_id = t.id
    WHERE pt.page_id = $1 AND pt.locale = $2
    `,
    [page_id, locale],
  );

  return result.rows[0];
};

/**
 * UPDATE PAGE TRANSLATION
 */
export const updatePageTranslation = async (
  id,
  title,
  slug,
  seo_title,
  seo_description,
) => {
  const result = await pool.query(
    `
    UPDATE page_translations
    SET 
      title = COALESCE($2, title),
      slug = COALESCE($3, slug),
      seo_title = COALESCE($4, seo_title),
      seo_description = COALESCE($5, seo_description)
    WHERE id = $1
    RETURNING *
    `,
    [id, title, slug, seo_title, seo_description],
  );

  return result.rows[0];
};

/**
 * DELETE TRANSLATION
 */
export const deletePageTranslation = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM page_translations
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};
