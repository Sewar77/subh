import pool from "../config/db.js";

export const registerUserModel = async ({
  name,
  email,
  hashed_password,
  role,
}) => {
  const result = await pool.query(
    `insert into users(name, email, hashed_password, role) values($1, $2, $3, $4)`,
    [name, email, hashed_password, role],
  );
  return result.rows[0];
};

export const getUserById = async (userId) => {
  const result = await pool.query(`select * from users where id = $1`, [
    userId,
  ]);
  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await pool.query(`select * from users where email = $1`, [
    email,
  ]);
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = pool.query(`select * from users`);
  return result.rows;
};
