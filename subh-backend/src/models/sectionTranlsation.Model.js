import db from "../config/db.js";

const validateContentByType = (type, content) => {
  switch (type) {
    case "text":
      return typeof content?.text === "string";

    case "image":
      return !!content?.image;

    case "image_text":
      return !!content?.image && typeof content?.text === "string";

    case "text_image":
      return !!content?.image && typeof content?.text === "string";

    default:
      return false;
  }
};

export const SectionTranslationModel = {
  async create({ section_id, locale, title, content }) {
    const sectionResult = await db.query(
      `SELECT type FROM sections WHERE id=$1`,
      [section_id],
    );

    const section = sectionResult.rows[0];

    if (!section) {
      throw new Error("Section not found");
    }

    if (!validateContentByType(section.type, content)) {
      throw new Error(
        `Invalid content structure for section type: ${section.type}`,
      );
    }

    const query = `
      INSERT INTO section_translations
      (
        section_id,
        locale,
        title,
        content
      )
      VALUES ($1,$2,$3,$4)
      RETURNING *
    `;

    const values = [section_id, locale, title, content || {}];

    const result = await db.query(query, values);

    return result.rows[0];
  },

  async getBySectionId(section_id) {
    const query = `
      SELECT *
      FROM section_translations
      WHERE section_id=$1
      ORDER BY locale ASC
    `;

    const result = await db.query(query, [section_id]);

    return result.rows;
  },

  async getBySectionAndLocale(section_id, locale) {
    const query = `
      SELECT *
      FROM section_translations
      WHERE section_id=$1
      AND locale=$2
    `;

    const result = await db.query(query, [section_id, locale]);

    return result.rows[0];
  },

  async update(id, data) {
    const currentResult = await db.query(
      `
      SELECT st.section_id, s.type
      FROM section_translations st
      JOIN sections s ON st.section_id=s.id
      WHERE st.id=$1
      `,
      [id],
    );

    const current = currentResult.rows[0];

    if (!current) {
      return null;
    }

    if (data.content && !validateContentByType(current.type, data.content)) {
      throw new Error(
        `Invalid content structure for section type: ${current.type}`,
      );
    }

    const query = `
      UPDATE section_translations
      SET
        title = COALESCE($2,title),
        content = COALESCE($3,content),
        is_visible = COALESCE($4,is_visible)
      WHERE id=$1
      RETURNING *
    `;

    const values = [id, data.title, data.content, data.is_visible];

    const result = await db.query(query, values);

    return result.rows[0];
  },

  async delete(id) {
    const query = `
      DELETE FROM section_translations
      WHERE id=$1
      RETURNING *
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];
  },
};
