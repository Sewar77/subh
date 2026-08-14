import pool from "../config/db.js";

const SAFE_USER_COLUMNS = [
  "id",
  "full_name",
  "email",
  "role",
  "user_type",
  "phone_number",
  "is_active",
  "email_verified",
  "created_at",
  "updated_at",
].join(", ");

const AUTH_USER_COLUMNS = [
  SAFE_USER_COLUMNS,
  "hashed_password",
].join(", ");

export const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const normalizeFullName = (value) =>
  typeof value === "string" ? value.trim() : "";

export const createUser = async ({
  fullName,
  email,
  phoneNumber = null,
  hashedPassword,
  role = "user",
  userType = null,
  isActive = true,
  emailVerified = false,
}, client = pool) => {
  const result = await client.query(
    `
      INSERT INTO users (
        full_name,
        email,
        hashed_password,
        role,
        user_type,
        phone_number,
        is_active,
        email_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING ${SAFE_USER_COLUMNS}
    `,
    [
      normalizeFullName(fullName),
      normalizeEmail(email),
      hashedPassword,
      role,
      userType,
      phoneNumber,
      isActive,
      emailVerified,
    ],
  );

  return result.rows[0] || null;
};

export const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = $1`,
    [userId],
  );

  return result.rows[0] || null;
};

export const getUserByEmailForAuth = async (email) => {
  const result = await pool.query(
    `
      SELECT ${AUTH_USER_COLUMNS}
      FROM users
      WHERE LOWER(TRIM(email)) = $1
    `,
    [normalizeEmail(email)],
  );

  return result.rows[0] || null;
};

export const getUserByEmailSafe = async (email) => {
  const result = await pool.query(
    `
      SELECT ${SAFE_USER_COLUMNS}
      FROM users
      WHERE LOWER(TRIM(email)) = $1
    `,
    [normalizeEmail(email)],
  );

  return result.rows[0] || null;
};

export const getAllUsers = async () => {
  const result = await pool.query(
    `
      SELECT ${SAFE_USER_COLUMNS}
      FROM users
      ORDER BY created_at DESC, id DESC
    `,
  );

  return result.rows;
};

export const countActiveAdmins = async (client = pool) => {
  const result = await client.query(
    `
      SELECT COUNT(*)::int AS active_admin_count
      FROM users
      WHERE role = $1 AND is_active = TRUE
    `,
    ["admin"],
  );

  return result.rows[0]?.active_admin_count ?? 0;
};

export { SAFE_USER_COLUMNS };
