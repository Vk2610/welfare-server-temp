import { pool } from '../../config/db.config.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();



// Save new user
export const createUser = async (userData) => {
  const {
    hrmsNo,
    emailIdId,
    branchName,
    branchRegionName,
    mobileNo,
    password,
    role = 'user'
  } = userData;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const userId = uuidv4(); // Generate UUID

    // Check for existing user with exact case matching
    const [existingUser] = await connection.query(
      'SELECT hrmsNo FROM user_profile WHERE BINARY hrmsNo = ? OR BINARY emailIdId = ?',
      [hrmsNo, emailIdId]
    );

    if (existingUser.length > 0) {
      throw new Error('User already exists with this HRMS No or emailId');
    }

    // Check for sub-admin with exact branch name matching
    if (role === 'sub-admin') {
      const [existingSubAdmin] = await connection.query(
        'SELECT hrmsNo FROM user_profile WHERE BINARY branchName = ? AND role = ?',
        [branchName, 'sub-admin']
      );

      if (existingSubAdmin.length > 0) {
        throw new Error(`Sub-admin already exists for branch ${branchName}`);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with UUID
    const query = `
      INSERT INTO user_profile (
        id,
        hrmsNo,
        emailIdId,
        branchName,
        branchRegionName,
        mobileNo,
        password,
        role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      hrmsNo,
      emailIdId,
      branchName,
      branchRegionName,
      mobileNo,
      hashedPassword,
      role
    ];

    await connection.query(query, values);
    await connection.commit();
    return { success: true, hrmsNo, userId };

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;

  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const getUserByUsername = async (username) => {
  const query = `
    SELECT * FROM user_profile
    WHERE hrmsNo = ?
  `;
  const [result] = await pool.query(query, [username]);
  if (result.length === 0) {
    throw new Error("User not found");
  }
  return result[0];
}

export const getUserById = async (id) => {
  const query = `
    SELECT * FROM user_profile
    WHERE id = ?
  `;
  const [result] = await pool.query(query, [id]);
  if (result.length === 0) {
    throw new Error("User not found");
  }
  return result[0];
}

// reset userpassword by emailId
export const resetUserPassword = async (Email_ID, password) => {
  if (!Email_ID || !password) {
    throw new Error("Email ID and password are required");
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    const query = `
      UPDATE user_profile
      SET password = ?
      WHERE emailId = ?
    `;
    
    const [result] = await pool.query(query, [hashedPassword, Email_ID]);

    if (result.affectedRows === 0) {
      throw new Error("User not found with this email");
    }

    return { success: true, message: "Password reset successful" };
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}


