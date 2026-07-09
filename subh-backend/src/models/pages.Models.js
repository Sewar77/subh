import pool from "../config/db.js";

// =========================
// CREATE PAGE
// =========================

export const createPage = async (key, name, status = "draft") => {
  const result = await pool.query(
    `
    INSERT INTO pages (key,name, status)
    VALUES ($1,$2, $3)
    RETURNING *
    `,
    [key, name, status],
  );

  return result.rows[0];
};

// =========================
// GET ALL PAGES
// =========================

export const getAllPages = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM pages
    ORDER BY created_at DESC
    `,
  );

  return result.rows;
};

// =========================
// GET PAGE BY ID
// =========================

export const getPageById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM pages
    WHERE id=$1
    `,
    [id],
  );

  return result.rows[0];
};

// =========================
// DELETE PAGE
// =========================

export const deletePage = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM pages
    WHERE id=$1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};

// =========================
// UPDATE PAGE
// =========================

export const updatePage = async (id, key, status) => {
  const result = await pool.query(
    `
    UPDATE pages
    SET
      key=$2,
      status=$3,
      updated_at=CURRENT_TIMESTAMP
    WHERE id=$1

    RETURNING *
    `,
    [id, key, status],
  );

  return result.rows[0];
};

// =========================
// GET PAGE BY KEY
// MAIN FRONTEND QUERY
// =========================

export const getPageByKeyModel = async (key) => {
  const result = await pool.query(
    `
SELECT

p.id,
p.key,
p.status,
p.created_at,
p.updated_at,


COALESCE(
json_agg(

jsonb_build_object(

'id',s.id,
'type',s.type,
'position',s.position,
'is_visible',s.is_visible,


'translations',

(
SELECT json_agg(

jsonb_build_object(

'id',st.id,
'locale',st.locale,
'title',st.title,
'content',st.content,
'is_visible',st.is_visible

)

)

FROM section_translations st

WHERE st.section_id=s.id

),


'media',

(
SELECT json_agg(

jsonb_build_object(

'media_id',sm.media_id,
'role',sm.role,
'position',sm.position

)

)

FROM section_media sm

WHERE sm.section_id=s.id

)


)

ORDER BY s.position

)

FILTER(
WHERE s.id IS NOT NULL
),

'[]'

) AS sections


FROM pages p

LEFT JOIN sections s
ON s.page_id=p.id
AND s.is_visible=true


WHERE p.key=$1


GROUP BY p.id

`,
    [key],
  );

  return result.rows[0];
};
