import { pool } from "../../config/db.config.js";

// Helper: date difference in days
const daysBetween = (date1, date2) => {
  const ms = new Date(date2) - new Date(date1);
  return ms / (1000 * 60 * 60 * 24);
};

export const getAdminStats = async (req, res) => {
  try {
    // 1️⃣ TOTAL USERS
    const [allUsers] = await pool.query("SELECT * FROM employees");

    // 2️⃣ RETIRING IN 60 DAYS
    const [retiring] = await pool.query(`
      SELECT * FROM employees 
      WHERE retirementDate IS NOT NULL
    `);

    let retiringSoon = retiring.filter((u) => {
      const days = daysBetween(new Date(), u.retirementDate);
      return days > 0 && days <= 60;
    });

    // 3️⃣ FULLY BENEFITED (dummy condition for now)
    const [benefited] = await pool.query(`
      SELECT * FROM employees WHERE employeeType = 'Benefited'
    `);

    res.json({
      totalUsers: allUsers.length,
      retiringSoon: retiringSoon.length,
      fullyBenefited: benefited.length
    });

  } catch (error) {
    console.error("Stats Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
