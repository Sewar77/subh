/* CREATE TABLE page_templates (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) */
import pool from "../config/db.js";
export const createPageTemplates = async (key, name) => {
  try {
    const result = await pool.query(
      `insert into page_templates(key, name)
        values($1, $2)
        returning *`,
      [key, name],
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
  }
};

export const updatePageTemplates = async (key, name, id) => {
  try {
    const result = await pool.query(
      `update page_templates set key=$1, name=$2 where id=$3 returning *`,
      [key, name, id],
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
  }
};
export const deletePageTemplate = async (id) => {
  try {
    const result = await pool.query(
      `delete * from page_templates where id = $1 returning *`,
      [id],
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
  }
};
export const getAllPageTemplates = async () => {
  try {
    const result = await pool.query(`select * from page_templates `);
    return result.rows;
  } catch (error) {
    console.error(error);
  }
};
export const getPageTemplatesById = async (id) => {
  try {
    const result = await pool.query(
      `select * from page_templates where id = $1`,
      [id],
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
  }
};
