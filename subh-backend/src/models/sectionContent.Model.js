import pool from "../config/db.js";

const CONTENT_PROJECTION = `
  id,
  section_id,
  locale,
  field_key,
  field_value,
  field_type,
  created_at,
  updated_at
`;

export const listSectionContentRecords = async (
  sectionId,
  client = pool,
) => {
  const result = await client.query(
    `
      SELECT ${CONTENT_PROJECTION}
      FROM section_content
      WHERE section_id = $1
      ORDER BY field_key ASC, locale ASC
    `,
    [sectionId],
  );
  return result.rows;
};

export const listContentRecordsBySectionIds = async (
  sectionIds,
  client = pool,
) => {
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) return [];

  const result = await client.query(
    `
      SELECT ${CONTENT_PROJECTION}
      FROM section_content
      WHERE section_id = ANY($1::bigint[])
      ORDER BY section_id ASC, field_key ASC, locale ASC
    `,
    [sectionIds],
  );
  return result.rows;
};

export const listPublicContentRecordsBySectionIds = async (
  sectionIds,
  locale,
  client = pool,
) => {
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) return [];
  const result = await client.query(
    `
      SELECT ${CONTENT_PROJECTION}
      FROM section_content
      WHERE section_id = ANY($1::bigint[])
        AND locale IN ($2, 'neutral')
      ORDER BY section_id ASC, field_key ASC, locale ASC
    `,
    [sectionIds, locale],
  );
  return result.rows;
};

export const upsertSectionContentRecords = async (
  sectionId,
  records,
  client,
) => {
  const rows = [];

  for (const record of records) {
    const result = await client.query(
      `
        INSERT INTO section_content (
          section_id,
          locale,
          field_key,
          field_value,
          field_type
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (section_id, locale, field_key)
        DO UPDATE SET
          field_value = EXCLUDED.field_value,
          field_type = EXCLUDED.field_type,
          updated_at = CURRENT_TIMESTAMP
        RETURNING ${CONTENT_PROJECTION}
      `,
      [
        sectionId,
        record.locale,
        record.fieldKey,
        record.fieldValue,
        record.fieldType,
      ],
    );
    rows.push(result.rows[0]);
  }

  return rows;
};

export const patchSectionContentRecords = async (sectionId, records) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT id FROM sections WHERE id = $1 FOR UPDATE", [
      sectionId,
    ]);
    await upsertSectionContentRecords(sectionId, records, client);
    const content = await listSectionContentRecords(sectionId, client);
    await client.query("COMMIT");
    return content;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
