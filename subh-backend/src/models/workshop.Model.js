import pool from "../config/db";

export const createWorkshop = async (workshopData) => {
  const result = await pool.query(
    `
  INSERT INTO workshops (
    name_en,
    name_ar,
    gender,
    min_age,
    max_age,
    is_all_ages,

    start_time,
    workshop_date,

    trainer_name_en,
    trainer_name_ar,

    description_en,
    description_ar,

    duration_h,
    price,

    trainer_description_en,
    trainer_description_ar,

    is_online,
    meeting_link,
    location_googlemap_link,

    is_user_paid,
    is_free,

    status,

    image,
    seats_number,
    created_at
  )
  VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8,
    $9, $10,
    $11, $12,
    $13, $14,
    $15, $16,
    $17, $18, $19,
    $20, $21,
    $22,
    $23, $24,
    CURRENT_TIMESTAMP
  )
  RETURNING *
  `,
    [
      workshopData.name_en,
      workshopData.name_ar,

      workshopData.gender,
      workshopData.min_age,
      workshopData.max_age,
      workshopData.is_all_ages,

      workshopData.start_time,
      workshopData.workshop_date,

      workshopData.trainer_name_en,
      workshopData.trainer_name_ar,

      workshopData.description_en,
      workshopData.description_ar,

      workshopData.duration_h,
      workshopData.price,

      workshopData.trainer_description_en,
      workshopData.trainer_description_ar,

      workshopData.is_online,
      workshopData.meeting_link,
      workshopData.location_googlemap_link,

      workshopData.is_user_paid,
      workshopData.is_free,

      workshopData.status,

      workshopData.image,
      workshopData.seats_number,
    ],
  );

  return result.rows[0];
};

export const getAllWorkshops = async () => {
  const result = await pool.query(
    `SELECT * FROM workshops ORDER BY created_at DESC`,
  );

  return result.rows;
};

export const getAvailableWorkshops = async () => {
  const result = await pool.query(
    `SELECT * FROM workshops WHERE status = 'available' ORDER BY created_at DESC`,
  );

  return result.rows;
};

export const getWorkshopById = async (id) => {
  const result = await pool.query(`SELECT * FROM workshops WHERE id = $1`, [
    id,
  ]);

  return result.rows[0] || null;
};
