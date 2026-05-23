import pool from "../config/db.js";

export const createMedia = async ({
  url,
  public_id,
  type,
  format,
  mime_type,
  size_kb,
  width,
  height,
  folder,
  alt_text,
  uploaded_by,
}) => {
  const result = await pool.query(
    `
    INSERT INTO media (
      url,
      public_id,
      type,
      format,
      mime_type,
      size_kb,
      width,
      height,
      folder,
      alt_text,
      uploaded_by
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
    )
    RETURNING *;
    `,
    [
      url,
      public_id,
      type,
      format,
      mime_type,
      size_kb,
      width,
      height,
      folder,
      alt_text,
      uploaded_by,
    ],
  );

  return result.rows[0];
};

export const getAllMedia = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM media
    ORDER BY created_at DESC;
    `,
  );

  return result.rows;
};

export const getMediaById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM media
    WHERE id = $1;
    `,
    [id],
  );

  return result.rows[0];
};

export const deleteMedia = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM media
    WHERE id = $1
    RETURNING *;
    `,
    [id],
  );

  return result.rows[0];
};

