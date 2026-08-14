import pool from "../config/db.js";

const SAFE_COMPANY_PROFILE_COLUMNS = [
  "company_name",
  "ein",
  "registration_number",
  "registration_state",
  "employee_count",
  "website",
  "verification_status",
].join(", ");

const nullableTrimmed = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
};

export const createCompanyProfile = async ({
  userId,
  companyName,
  ein = null,
  registrationNumber = null,
  registrationState = null,
  employeeCount,
  website = null,
}, client = pool) => {
  const result = await client.query(
    `
      INSERT INTO company_profiles (
        user_id,
        company_name,
        ein,
        registration_number,
        registration_state,
        employee_count,
        website
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${SAFE_COMPANY_PROFILE_COLUMNS}
    `,
    [
      userId,
      companyName.trim(),
      nullableTrimmed(ein),
      nullableTrimmed(registrationNumber),
      nullableTrimmed(registrationState),
      employeeCount,
      nullableTrimmed(website),
    ],
  );

  return result.rows[0] || null;
};

export const getCompanyProfileByUserId = async (userId, client = pool) => {
  const result = await client.query(
    `
      SELECT ${SAFE_COMPANY_PROFILE_COLUMNS}
      FROM company_profiles
      WHERE user_id = $1
    `,
    [userId],
  );

  return result.rows[0] || null;
};

export { SAFE_COMPANY_PROFILE_COLUMNS };
