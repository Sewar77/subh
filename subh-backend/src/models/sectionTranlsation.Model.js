import db from "../config/db.js";

const LEGACY_TRANSLATION_PROJECTION = `
  id,
  section_id,
  locale,
  title,
  content,
  is_visible
`;

export const SectionTranslationModel = {
  async getById(id, client = db) {
    const result = await client.query(
      `
        SELECT ${LEGACY_TRANSLATION_PROJECTION}
        FROM section_translations
        WHERE id = $1
      `,
      [id],
    );
    return result.rows[0] || null;
  },

  async getBySectionId(sectionId, client = db) {
    const result = await client.query(
      `
        SELECT ${LEGACY_TRANSLATION_PROJECTION}
        FROM section_translations
        WHERE section_id = $1
        ORDER BY locale ASC
      `,
      [sectionId],
    );
    return result.rows;
  },

  async getBySectionIds(sectionIds, client = db) {
    if (!Array.isArray(sectionIds) || sectionIds.length === 0) return [];
    const result = await client.query(
      `
        SELECT ${LEGACY_TRANSLATION_PROJECTION}
        FROM section_translations
        WHERE section_id = ANY($1::bigint[])
        ORDER BY section_id ASC, locale ASC
      `,
      [sectionIds],
    );
    return result.rows;
  },

  async getPublicBySectionIds(sectionIds, locale, client = db) {
    if (!Array.isArray(sectionIds) || sectionIds.length === 0) return [];
    const result = await client.query(
      `
        SELECT ${LEGACY_TRANSLATION_PROJECTION}
        FROM section_translations
        WHERE section_id = ANY($1::bigint[])
          AND locale = $2
        ORDER BY section_id ASC, locale ASC
      `,
      [sectionIds, locale],
    );
    return result.rows;
  },

  async getBySectionAndLocale(sectionId, locale, client = db) {
    const result = await client.query(
      `
        SELECT ${LEGACY_TRANSLATION_PROJECTION}
        FROM section_translations
        WHERE section_id = $1 AND locale = $2
      `,
      [sectionId, locale],
    );
    return result.rows[0] || null;
  },
};
