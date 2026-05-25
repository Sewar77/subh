import pool from "../config/db.js";

export const createPageTranslation = async ({
  pageId,
  slug,
  locale,
  title,
  seo_title,
  seo_description,
}) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO page_translations
      (
        page_id,
        slug,
        locale,
        title,
        seo_title,
        seo_description
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [pageId, slug, locale, title, seo_title, seo_description],
    );

    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Translation already exists for this locale");
    }

    throw new Error("Failed to create page translation");
  }
};

export const getPageTranslationsByPageId = async (pageId) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM page_translations
      WHERE page_id = $1
      `,
      [pageId],
    );

    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch translations");
  }
};

export const getPageTranslationBySlug = async (slug, locale) => {
  try {
    const result = await pool.query(
      `
      SELECT pt.*, p.id AS page_id, p.status, p.default_locale
      FROM page_translations pt
      JOIN pages p ON p.id = pt.page_id
      WHERE pt.slug = $1 AND pt.locale = $2
      LIMIT 1
      `,
      [slug, locale],
    );

    return result.rows[0];
  } catch (err) {
    throw new Error("Failed to fetch page translation");
  }
};
