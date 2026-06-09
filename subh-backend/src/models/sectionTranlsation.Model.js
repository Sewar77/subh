import db from "../config/db.js";

export const SectionTranslationModel = {
  async create({ section_id, locale, title, content }) {
    const query = `
      INSERT INTO section_translations (section_id, locale, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [section_id, locale, title, content];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getBySectionId(section_id) {
    const query = `
      SELECT *
      FROM section_translations
      WHERE section_id = $1
    `;
    const result = await db.query(query, [section_id]);
    return result.rows;
  },
  async getBySectionAndLocale(section_id, locale) {
    const query = `
      SELECT *
      FROM section_translations
      WHERE section_id = $1 AND locale = $2
    `;
    const result = await db.query(query, [section_id, locale]);
    return result.rows[0];
  },

  async update(id, data) {
    const query = `
      UPDATE section_translations
      SET 
        title = COALESCE($2, title),
        content = COALESCE($3, content),
        is_visible = COALESCE($4, is_visible)
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, data.title, data.content, data.is_visible];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const query = `
      DELETE FROM section_translations
      WHERE id = $1
    `;

    await db.query(query, [id]);
  },
};
