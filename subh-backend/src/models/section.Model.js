import pool from "../config/db.js";

/**
 * CREATE SECTION
 */

export const createSection = async (page_id, type) => {
  // 1. Get next position for this page
  const positionResult = await pool.query(
    `
    SELECT COALESCE(MAX(position), 0) + 1 AS next_position
    FROM sections
    WHERE page_id = $1
    `,
    [page_id],
  );

  const nextPosition = positionResult.rows[0].next_position;

  // 2. Insert section with correct position
  const result = await pool.query(
    `
    INSERT INTO sections (page_id, type, position)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [page_id, type, nextPosition],
  );

  return result.rows[0];
};

/**
 * GET ALL SECTIONS BY PAGE (FAST RENDER QUERY)
 */
export const getSectionsByPage = async (page_id) => {
  const result = await pool.query(
    `
    SELECT 
      s.id,
      s.page_id,
      s.type,
      s.position,
      s.is_visible,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', st.id,
            'locale', st.locale,
            'title', st.title,
            'content', st.content,
            'is_visible', st.is_visible
          )
        ) FILTER (WHERE st.id IS NOT NULL),
        '[]'
      ) AS translations

    FROM sections s
    LEFT JOIN section_translations st
      ON s.id = st.section_id

    WHERE s.page_id = $1
      AND s.is_visible = true

    GROUP BY s.id
    ORDER BY s.position ASC
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
    SELECT 
      s.*,

      -- PAGE INFO
      p.key AS page_key,
      p.status AS page_status,
      p.template_id,

      -- TEMPLATE INFO
      t.key AS template_key,
      t.name AS template_name

    FROM sections s
    JOIN pages p ON s.page_id = p.id
    LEFT JOIN page_templates t ON p.template_id = t.id
    WHERE s.id = $1
    `,
    [id],
  );

  const section = result.rows[0];

  if (!section) return null;

  // GET TRANSLATIONS
  const translationsResult = await pool.query(
    `
    SELECT *
    FROM section_translations
    WHERE section_id = $1
    ORDER BY locale ASC
    `,
    [id],
  );

  // GET MEDIA
  const mediaResult = await pool.query(
    `
    SELECT sm.*, m.*
    FROM section_media sm
    JOIN media m ON m.id = sm.media_id
    WHERE sm.section_id = $1
    ORDER BY sm.position ASC
    `,
    [id],
  );

  return {
    ...section,
    translations: translationsResult.rows || [],
    media: mediaResult.rows || [],
  };
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

export const getAllSections = async () => {
  const result = await pool.query(`
    SELECT 
      s.*,

      -- PAGE
      p.key AS page_key,
      p.status,
      p.template_id,

      -- TEMPLATE
      t.key AS template_key,
      t.name AS template_name,

      -- TRANSLATIONS
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', st.id,
            'locale', st.locale,
            'title', st.title,
            'content', st.content,
            'is_visible', st.is_visible
          )
        ) FILTER (WHERE st.id IS NOT NULL),
        '[]'
      ) AS translations,

      -- MEDIA
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'media_id', sm.media_id,
            'role', sm.role,
            'position', sm.position
          )
        ) FILTER (WHERE sm.media_id IS NOT NULL),
        '[]'
      ) AS media

    FROM sections s
    JOIN pages p ON s.page_id = p.id
    LEFT JOIN page_templates t ON p.template_id = t.id
    LEFT JOIN section_translations st ON s.id = st.section_id
    LEFT JOIN section_media sm ON s.id = sm.section_id

    GROUP BY 
      s.id, p.id, t.id

    ORDER BY s.position ASC
  `);

  return result.rows;
};
