import pool from "../config/db.js";

export const deleteUser = async (userId) => {
  await pool.query(`delete from users where id = $1 returning *`, [userId]);
};
export const updateUser = async (userId, userType, userRole) => {
  console.log("model:", userId, userType, userRole);

  const result = await pool.query(
    `UPDATE users 
     SET role = $1, user_type = $2 
     WHERE id = $3 
     RETURNING *`,
    [userRole, userType, userId],
  );

  console.log("result:", result.rows[0]);

  return result.rows[0];
};
