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
