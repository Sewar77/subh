import pool from "../config/db.js";
/*
TABLE:
pages (
  id BIGSERIAL PRIMARY KEY,
  template_id BIGINT REFERENCES page_templates(id),
  key VARCHAR(150) UNIQUE NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
*/

export const createPage = async (template_id, key) => {
  const result = await pool.query(
    `
    INSERT INTO pages (template_id, key)
    VALUES ($1, $2)
    RETURNING *
    `,
    [template_id, key],
  );

  return result.rows[0];
};

export const getAllPages = async () => {
  const result = await pool.query(`
    SELECT 
      p.*,
      t.key AS template_key,
      t.name AS template_name
    FROM pages p
    JOIN page_templates t ON p.template_id = t.id
    ORDER BY p.created_at DESC
  `);

  return result.rows;
};

export const getPageById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      p.*,
      t.key AS template_key,
      t.name AS template_name
    FROM pages p
    JOIN page_templates t ON p.template_id = t.id
    WHERE p.id = $1
    `,
    [id],
  );

  return result.rows[0];
};

export const deletePage = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM pages
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};

export const updatePage = async (key, template_id, id) => {
  const result = await pool.query(
    `
    UPDATE pages
    SET key = $1,
        template_id = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
    `,
    [key, template_id, id],
  );

  return result.rows[0];
};
