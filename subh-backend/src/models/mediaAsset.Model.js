import pool from "../config/db.js";

export const MEDIA_ASSET_PROJECTION = `
  asset.id,
  asset.secure_url,
  asset.cloudinary_public_id,
  asset.original_filename,
  asset.display_name,
  asset.mime_type,
  asset.format,
  asset.width,
  asset.height,
  asset.bytes,
  asset.alt_text_en,
  asset.alt_text_ar,
  asset.source,
  asset.uploaded_by_admin_id,
  asset.archived_at,
  asset.created_at,
  asset.updated_at,
  uploader.id AS uploader_id,
  uploader.full_name AS uploader_name
`;

const selectAssetById = async (id, db = pool) => {
  const result = await db.query(
    `
      SELECT ${MEDIA_ASSET_PROJECTION}
      FROM media_assets asset
      LEFT JOIN users uploader ON uploader.id = asset.uploaded_by_admin_id
      WHERE asset.id = $1
    `,
    [id],
  );
  return result.rows[0] || null;
};

export const listMediaAssets = async (
  { page = 1, limit = 24, search = "", status = "active" } = {},
  db = pool,
) => {
  const numericPage = Number(page);
  const numericLimit = Number(limit);
  const safePage = Number.isInteger(numericPage) && numericPage > 0
    ? numericPage
    : 1;
  const safeLimit = Number.isInteger(numericLimit) && numericLimit > 0
    ? Math.min(numericLimit, 100)
    : 24;
  const safeStatus = ["active", "archived", "all"].includes(status)
    ? status
    : "active";
  const offset = (safePage - 1) * safeLimit;
  const values = [];
  const filters = [];

  if (safeStatus === "active") filters.push("asset.archived_at IS NULL");
  if (safeStatus === "archived") filters.push("asset.archived_at IS NOT NULL");
  if (search) {
    values.push(`%${String(search).trim()}%`);
    const placeholder = `$${values.length}`;
    filters.push(`(
      asset.display_name ILIKE ${placeholder}
      OR asset.original_filename ILIKE ${placeholder}
      OR asset.alt_text_en ILIKE ${placeholder}
      OR asset.alt_text_ar ILIKE ${placeholder}
    )`);
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM media_assets asset ${where}`,
    values,
  );
  const total = countResult.rows[0]?.total ?? 0;
  const result = await db.query(
    `
      SELECT ${MEDIA_ASSET_PROJECTION}
      FROM media_assets asset
      LEFT JOIN users uploader ON uploader.id = asset.uploaded_by_admin_id
      ${where}
      ORDER BY asset.created_at DESC, asset.id DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `,
    [...values, safeLimit, offset],
  );
  return {
    assets: result.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
    },
  };
};

export const getMediaAssetById = selectAssetById;

export const createUploadedMediaAsset = async (payload, db = pool) => {
  const result = await db.query(
    `
      WITH inserted AS (
        INSERT INTO media_assets (
          secure_url,
          cloudinary_public_id,
          original_filename,
          display_name,
          mime_type,
          format,
          width,
          height,
          bytes,
          alt_text_en,
          alt_text_ar,
          source,
          uploaded_by_admin_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'uploaded', $12)
        RETURNING
          id, secure_url, cloudinary_public_id, original_filename,
          display_name, mime_type, format, width, height, bytes,
          alt_text_en, alt_text_ar, source, uploaded_by_admin_id,
          archived_at, created_at, updated_at
      )
      SELECT ${MEDIA_ASSET_PROJECTION}
      FROM inserted asset
      LEFT JOIN users uploader ON uploader.id = asset.uploaded_by_admin_id
    `,
    [
      payload.secureUrl,
      payload.publicId,
      payload.originalFilename,
      payload.displayName,
      payload.mimeType,
      payload.format,
      payload.width,
      payload.height,
      payload.bytes,
      payload.altTextEn,
      payload.altTextAr,
      payload.uploadedByAdminId,
    ],
  );
  return result.rows[0] || null;
};

const METADATA_COLUMNS = {
  displayName: "display_name",
  altTextEn: "alt_text_en",
  altTextAr: "alt_text_ar",
};

export const updateMediaAssetMetadata = async (id, payload, db = pool) => {
  const assignments = [];
  const values = [id];
  for (const [field, column] of Object.entries(METADATA_COLUMNS)) {
    if (!Object.hasOwn(payload, field)) continue;
    values.push(payload[field]);
    assignments.push(`${column} = $${values.length}`);
  }
  if (assignments.length === 0) return null;
  const result = await db.query(
    `
      UPDATE media_assets
      SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `,
    values,
  );
  return result.rows[0] ? selectAssetById(id, db) : null;
};

export const archiveMediaAsset = async (id, db = pool) => {
  const result = await db.query(
    `
      UPDATE media_assets
      SET archived_at = COALESCE(archived_at, CURRENT_TIMESTAMP),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );
  return result.rows[0] ? selectAssetById(id, db) : null;
};

export const restoreMediaAsset = async (id, db = pool) => {
  const result = await db.query(
    `
      UPDATE media_assets
      SET archived_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );
  return result.rows[0] ? selectAssetById(id, db) : null;
};
