import pool from "../config/db.js";

export const deleteUser = async (userId) => {
  await pool.query(`delete from users where id = $1 returning *`, [userId]);
};

