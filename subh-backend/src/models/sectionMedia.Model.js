import pool from "../config/db.js";
import { normalizePublicLocale } from "../utils/locale.js";

const MEDIA_PROJECTION = `
  id,
  section_id,
  slot_key,
  media_type,
  file_ref,
  position,
  alt_en,
  alt_ar,
  caption_en,
  caption_ar,
  created_at,
  updated_at
`;

export const listSectionMedia = async (sectionId, client = pool) => {
  const result = await client.query(
    `
      SELECT ${MEDIA_PROJECTION}
      FROM section_media_items
      WHERE section_id = $1
      ORDER BY slot_key ASC, position ASC, id ASC
    `,
    [sectionId],
  );
  return result.rows;
};

export const listMediaBySectionIds = async (sectionIds, client = pool) => {
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) return [];

  const result = await client.query(
    `
      SELECT ${MEDIA_PROJECTION}
      FROM section_media_items
      WHERE section_id = ANY($1::bigint[])
      ORDER BY section_id ASC, slot_key ASC, position ASC, id ASC
    `,
    [sectionIds],
  );
  return result.rows;
};

export const listPublicMediaBySectionIds = async (
  sectionIds,
  locale,
  client = pool,
) => {
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) return [];
  const suffix = normalizePublicLocale(locale) === "ar" ? "ar" : "en";
  const result = await client.query(
    `
      SELECT
        id,
        section_id,
        slot_key,
        media_type,
        file_ref,
        position,
        alt_${suffix} AS alt,
        caption_${suffix} AS caption
      FROM section_media_items
      WHERE section_id = ANY($1::bigint[])
      ORDER BY section_id ASC, slot_key ASC, position ASC, id ASC
    `,
    [sectionIds],
  );
  return result.rows;
};

export const listSectionMediaSlot = async (
  sectionId,
  slotKey,
  client = pool,
  lockRows = false,
) => {
  const lockClause = lockRows ? "FOR UPDATE" : "";
  const result = await client.query(
    `
      SELECT ${MEDIA_PROJECTION}
      FROM section_media_items
      WHERE section_id = $1 AND slot_key = $2
      ORDER BY position ASC, id ASC
      ${lockClause}
    `,
    [sectionId, slotKey],
  );
  return result.rows;
};

export const getSectionMediaById = async (mediaId, client = pool) => {
  const result = await client.query(
    `
      SELECT ${MEDIA_PROJECTION}
      FROM section_media_items
      WHERE id = $1
    `,
    [mediaId],
  );
  return result.rows[0] || null;
};

export const insertSectionMedia = async (
  sectionId,
  mediaPayload,
  client,
) => {
  const result = await client.query(
    `
      INSERT INTO section_media_items (
        section_id,
        slot_key,
        media_type,
        file_ref,
        position,
        alt_en,
        alt_ar,
        caption_en,
        caption_ar
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING ${MEDIA_PROJECTION}
    `,
    [
      sectionId,
      mediaPayload.slot,
      mediaPayload.mediaType,
      mediaPayload.fileRef,
      mediaPayload.position,
      mediaPayload.altEn ?? null,
      mediaPayload.altAr ?? null,
      mediaPayload.captionEn ?? null,
      mediaPayload.captionAr ?? null,
    ],
  );
  return result.rows[0];
};

export const createSectionMedia = async (
  sectionId,
  mediaPayload,
  slotDefinition,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT id FROM sections WHERE id = $1 FOR UPDATE", [
      sectionId,
    ]);
    const current = await listSectionMediaSlot(
      sectionId,
      mediaPayload.slot,
      client,
      true,
    );

    if (!slotDefinition.multiple && current.length > 0) {
      const error = new Error("Media slot accepts only one item");
      error.code = "CMS_MEDIA_SLOT_FULL";
      throw error;
    }
    if (current.length >= slotDefinition.maxItems) {
      const error = new Error("Media slot has reached its item limit");
      error.code = "CMS_MEDIA_SLOT_FULL";
      throw error;
    }

    const item = await insertSectionMedia(
      sectionId,
      {
        ...mediaPayload,
        position: mediaPayload.position ?? current.length,
      },
      client,
    );
    await client.query("COMMIT");
    return item;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateSectionMediaItem = async (
  mediaId,
  sectionId,
  mediaPayload,
  client = pool,
) => {
  const has = (key) => Object.hasOwn(mediaPayload, key);
  const result = await client.query(
    `
      UPDATE section_media_items
      SET
        file_ref = CASE WHEN $3 THEN $4 ELSE file_ref END,
        position = CASE WHEN $5 THEN $6 ELSE position END,
        alt_en = CASE WHEN $7 THEN $8 ELSE alt_en END,
        alt_ar = CASE WHEN $9 THEN $10 ELSE alt_ar END,
        caption_en = CASE WHEN $11 THEN $12 ELSE caption_en END,
        caption_ar = CASE WHEN $13 THEN $14 ELSE caption_ar END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND section_id = $2
      RETURNING ${MEDIA_PROJECTION}
    `,
    [
      mediaId,
      sectionId,
      has("fileRef"),
      mediaPayload.fileRef ?? null,
      has("position"),
      mediaPayload.position ?? null,
      has("altEn"),
      mediaPayload.altEn ?? null,
      has("altAr"),
      mediaPayload.altAr ?? null,
      has("captionEn"),
      mediaPayload.captionEn ?? null,
      has("captionAr"),
      mediaPayload.captionAr ?? null,
    ],
  );
  return result.rows[0] || null;
};

export const patchSectionMedia = async (mediaId, sectionId, mediaPayload) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      "SELECT id FROM section_media_items WHERE id = $1 AND section_id = $2 FOR UPDATE",
      [mediaId, sectionId],
    );
    const item = await updateSectionMediaItem(
      mediaId,
      sectionId,
      mediaPayload,
      client,
    );
    await client.query("COMMIT");
    return item;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const upsertFirstMediaInSlot = async (
  sectionId,
  mediaPayload,
  client,
) => {
  await client.query("SELECT id FROM sections WHERE id = $1 FOR UPDATE", [
    sectionId,
  ]);
  const current = await listSectionMediaSlot(
    sectionId,
    mediaPayload.slot,
    client,
    true,
  );
  if (current[0]) {
    return updateSectionMediaItem(
      current[0].id,
      sectionId,
      { fileRef: mediaPayload.fileRef },
      client,
    );
  }
  return insertSectionMedia(
    sectionId,
    { ...mediaPayload, position: 0 },
    client,
  );
};

export const reorderSectionMedia = async (sectionId, slotKey, items) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT id FROM sections WHERE id = $1 FOR UPDATE", [
      sectionId,
    ]);
    const current = await listSectionMediaSlot(sectionId, slotKey, client, true);
    const currentIds = current.map(({ id }) => Number(id)).sort((a, b) => a - b);
    const submittedIds = items
      .map(({ id }) => Number(id))
      .sort((a, b) => a - b);

    if (
      currentIds.length !== submittedIds.length ||
      currentIds.some((id, index) => id !== submittedIds[index])
    ) {
      const error = new Error("Reorder payload must include every item in the slot");
      error.code = "CMS_MEDIA_REORDER_MISMATCH";
      throw error;
    }

    for (const item of items) {
      await client.query(
        `
          UPDATE section_media_items
          SET position = $3, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND section_id = $2 AND slot_key = $4
        `,
        [item.id, sectionId, item.position, slotKey],
      );
    }
    const reordered = await listSectionMediaSlot(sectionId, slotKey, client);
    await client.query("COMMIT");
    return reordered;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteSectionMedia = async (mediaId, sectionId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const existing = await getSectionMediaById(mediaId, client);
    if (!existing || Number(existing.section_id) !== Number(sectionId)) {
      await client.query("COMMIT");
      return null;
    }

    await client.query("SELECT id FROM sections WHERE id = $1 FOR UPDATE", [
      sectionId,
    ]);
    const result = await client.query(
      `
        DELETE FROM section_media_items
        WHERE id = $1 AND section_id = $2
        RETURNING ${MEDIA_PROJECTION}
      `,
      [mediaId, sectionId],
    );
    const remaining = await listSectionMediaSlot(
      sectionId,
      existing.slot_key,
      client,
      true,
    );
    for (const [position, item] of remaining.entries()) {
      await client.query(
        `
          UPDATE section_media_items
          SET position = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [item.id, position],
      );
    }
    await client.query("COMMIT");
    return result.rows[0] || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
