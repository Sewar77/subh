import pool from "../config/db.js";
import { SAFE_USER_COLUMNS } from "./auth.Models.js";

const USER_FIELD_COLUMNS = {
  fullName: "full_name",
  email: "email",
  phoneNumber: "phone_number",
  userType: "user_type",
  role: "role",
  isActive: "is_active",
  emailVerified: "email_verified",
};

const buildUpdate = (payload = {}) => {
  const assignments = [];
  const values = [];

  for (const [field, column] of Object.entries(USER_FIELD_COLUMNS)) {
    if (payload[field] === undefined) continue;
    values.push(payload[field]);
    assignments.push(`${column} = $${values.length + 1}`);
  }

  return { assignments, values };
};

const locksLastActiveAdmin = (user, payload) =>
  user.role === "admin" &&
  user.is_active === true &&
  (payload.role === "user" || payload.isActive === false);

const withLockedUser = async (userId, callback) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const activeAdmins = await client.query(
      `
        SELECT id
        FROM users
        WHERE role = $1 AND is_active = TRUE
        FOR UPDATE
      `,
      ["admin"],
    );
    const currentResult = await client.query(
      `SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = $1 FOR UPDATE`,
      [userId],
    );
    const user = currentResult.rows[0] || null;
    const result = await callback(client, user, activeAdmins.rowCount);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const assertNotLastActiveAdmin = (user, payload, activeAdminCount) => {
  if (!user || !locksLastActiveAdmin(user, payload)) return;

  if (activeAdminCount <= 1) {
    const error = new Error("Cannot deactivate or demote the last active administrator");
    error.code = "LAST_ACTIVE_ADMIN";
    throw error;
  }
};

export const updateUser = async (userId, payload = {}) => {
  const { assignments, values } = buildUpdate(payload);
  if (assignments.length === 0) return null;

  return withLockedUser(userId, async (client, user, activeAdminCount) => {
    if (!user) return null;
    assertNotLastActiveAdmin(user, payload, activeAdminCount);

    const result = await client.query(
      `
        UPDATE users
        SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING ${SAFE_USER_COLUMNS}
      `,
      [userId, ...values],
    );

    return result.rows[0] || null;
  });
};

export const deactivateUser = async (userId) =>
  updateUser(userId, { isActive: false });

export const updateUserPassword = async (userId, hashedPassword) => {
  const result = await pool.query(
    `
      UPDATE users
      SET hashed_password = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING ${SAFE_USER_COLUMNS}
    `,
    [userId, hashedPassword],
  );

  return result.rows[0] || null;
};
