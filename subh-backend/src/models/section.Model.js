import pool from "../config/db.js";

// =========================
// CREATE SECTION
// =========================

export const createSection = async (page_id, type) => {
  const allowedTypes = ["image", "image-text", "text-image", "text"];

  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid section type");
  }

  const positionResult = await pool.query(
    `
    SELECT COALESCE(MAX(position),0)+1 AS next_position
    FROM sections
    WHERE page_id=$1
    `,
    [page_id],
  );

  const position = positionResult.rows[0].next_position;

  const result = await pool.query(
    `
    INSERT INTO sections
    (
      page_id,
      type,
      position
    )
    VALUES($1,$2,$3)
    RETURNING *
    `,
    [page_id, type, position],
  );

  return result.rows[0];
};

// =========================
// GET SECTIONS BY PAGE
// Used by frontend
// =========================

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

jsonb_build_object(

'id',st.id,
'locale',st.locale,
'title',st.title,
'content',st.content,
'is_visible',st.is_visible

)

)

FILTER(
WHERE st.id IS NOT NULL
),

'[]'

) AS translations



FROM sections s


LEFT JOIN section_translations st

ON s.id=st.section_id



WHERE 
s.page_id=$1
AND s.is_visible=true



GROUP BY s.id


ORDER BY s.position ASC

`,
    [page_id],
  );

  return result.rows;
};

// =========================
// GET SECTION BY ID
// Admin editing
// =========================

export const getSectionById = async (id) => {
  const result = await pool.query(
    `
    SELECT

        s.id,
        s.page_id,
        s.type,
        s.position,
        s.is_visible,
        s.created_at,

        p.key AS page_key,
        p.name AS page_name,
        p.status AS page_status,

        COALESCE(
            json_agg(
                jsonb_build_object(
                    'id', st.id,
                    'locale', st.locale,
                    'title', st.title,
                    'content', st.content,
                    'is_visible', st.is_visible
                )
            )
            FILTER(
                WHERE st.id IS NOT NULL
            ),
            '[]'
        ) AS translations

    FROM sections s

    JOIN pages p
    ON s.page_id = p.id

    LEFT JOIN section_translations st
    ON s.id = st.section_id

    WHERE s.id = $1

    GROUP BY
        s.id,
        p.id

    `,
    [id],
  );

  const section = result.rows[0];

  if (!section) {
    return null;
  }

  return section;
};

// =========================
// UPDATE SECTION
// =========================

export const updateSection = async (id, type, position, is_visible) => {
  const result = await pool.query(
    `
UPDATE sections

SET

type=COALESCE($2,type),

position=COALESCE($3,position),

is_visible=COALESCE($4,is_visible)


WHERE id=$1


RETURNING *

`,
    [id, type, position, is_visible],
  );

  return result.rows[0];
};

// =========================
// DELETE SECTION
// =========================

export const deleteSection = async (id) => {
  const result = await pool.query(
    `
DELETE FROM sections

WHERE id=$1

RETURNING *

`,
    [id],
  );

  return result.rows[0];
};

// =========================
// GET ALL SECTIONS
// Admin dashboard
// =========================

export const getAllSections = async () => {
  const result = await pool.query(
    `SELECT
    s.id,
    s.page_id,
    s.type,
    s.position,
    s.is_visible,

    p.key AS page_key,
    p.status AS page_status,

    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', st.id,
                'locale', st.locale,
                'title', st.title,
                'content', st.content,
                'is_visible', st.is_visible
            )
        )
        FILTER(
            WHERE st.id IS NOT NULL
        ),
        '[]'
    ) AS translations

FROM sections s

JOIN pages p
ON s.page_id = p.id

LEFT JOIN section_translations st
ON s.id = st.section_id

GROUP BY
    s.id,
    p.id

ORDER BY
    s.position ASC;
`,
  );

  return result.rows;
};

// =========================
// TOGGLE SECTION VISIBILITY
// =========================

export const toggleSectionVisibility = async (id) => {
  const result = await pool.query(
    `
    UPDATE sections

    SET 
      is_visible = NOT is_visible

    WHERE id=$1

    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};
