import pool from "../config/db.js";

export const createPage = async ({
  slug,

  title_en,
  title_ar,

  seo_title_en,
  seo_title_ar,

  seo_description_en,
  seo_description_ar,
}) => {
  const result = await pool.query(
    `
    INSERT INTO pages (
      slug,
      title_en,
      title_ar,
      seo_title_en,
      seo_title_ar,
      seo_description_en,
      seo_description_ar
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
    `,
    [
      slug,
      title_en,
      title_ar,
      seo_title_en || null,
      seo_title_ar || null,
      seo_description_en || null,
      seo_description_ar || null,
    ],
  );

  return result.rows[0];
};

export const getAllPages = async () => {
  const result = await pool.query(`
    SELECT *
    FROM pages
    ORDER BY created_at DESC;
  `);

  return result.rows;
};

export const getPageBySlug = async (slug) => {
  const result = await pool.query(
    `
    SELECT *
    FROM pages
    WHERE slug = $1;
    `,
    [slug],
  );

  return result.rows[0];
};

export const updatePage = async (
  id,
  {
    title_en,
    title_ar,

    seo_title_en,
    seo_title_ar,

    seo_description_en,
    seo_description_ar,
  },
) => {
  const result = await pool.query(
    `
    UPDATE pages
    SET
      title_en = COALESCE($1, title_en),
      title_ar = COALESCE($2, title_ar),

      seo_title_en = COALESCE($3, seo_title_en),
      seo_title_ar = COALESCE($4, seo_title_ar),

      seo_description_en = COALESCE($5, seo_description_en),
      seo_description_ar = COALESCE($6, seo_description_ar),

      updated_at = NOW()
    WHERE id = $7
    RETURNING *;
    `,
    [
      title_en,
      title_ar,
      seo_title_en,
      seo_title_ar,
      seo_description_en,
      seo_description_ar,
      id,
    ],
  );

  return result.rows[0];
};

export const deletePage = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM pages
    WHERE id = $1
    RETURNING *;
    `,
    [id],
  );

  return result.rows[0];
};
