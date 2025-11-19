import { pool } from "../../config/db.config.js";

// Login user using hrmsNo and password
export const loginUser = async (hrmsNo, password) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM user_profile WHERE hrmsNo = ?',
      [hrmsNo]
    );
    if (rows.length === 0) {
      return null; // User not found
    }
    const user = rows[0];
    return user;
  } catch (error) {
    throw error;
  }
};

// reset password 
export const resetPassword = async (hrmsNo, newPassword) => {
  try {
    const [result] = await pool.execute(
      'UPDATE user_profile SET password = ? WHERE hrmsNo = ?',
      [newPassword, hrmsNo]
    );
    return result.affectedRows > 0;
    }
  catch (error) {
    throw error;
  }
};