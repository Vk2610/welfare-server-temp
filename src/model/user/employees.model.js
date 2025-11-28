// employees.model.js
import { pool } from "../../config/db.config.js";
import { v4 as uuidv4 } from "uuid";

// ------------------------------
// CREATE TABLE
// ------------------------------
export default async function createEmployeesTable(){
  const query = `
    CREATE TABLE IF NOT EXISTS employees (
      id VARCHAR(255) PRIMARY KEY,
      hrmsNo VARCHAR(20) UNIQUE NOT NULL,

      employeeName VARCHAR(255),
      profileType VARCHAR(100),
      gender VARCHAR(20),
      maritalStatus VARCHAR(50),
      panNo VARCHAR(20),
      emailId VARCHAR(200),
      password VARCHAR(255),

      currentAppointmentDate DATE,
      currentAppointmentType VARCHAR(100),

      firstAppointmentDate DATE,
      firstJoiningDate DATE,
      firstAppointmentType VARCHAR(100),

      employeeType VARCHAR(50),

      approvalRefNo VARCHAR(100),
      approvalLetterDate DATE,

      retirementDate DATE,
      appointmentNature VARCHAR(100),

      qualifications VARCHAR(500),

      mobileNo VARCHAR(20),
      presentAddress TEXT,
      permanentAddress TEXT,

      branchName VARCHAR(255),
      branchRegionName VARCHAR(255),
      branchType VARCHAR(255),
      branchJoiningDate DATE,

      designation VARCHAR(100),
      role VARCHAR(50) DEFAULT 'user'
    );
  `;

  await pool.execute(query);
  console.log("✅ employees table created successfully");
};

createEmployeesTable();

// ------------------------------
// INSERT EMPLOYEE
// ------------------------------
export const insertEmployee = async (employeeData) => {
  const id = uuidv4();

  const query = `
    INSERT INTO employees (
      id, hrmsNo, employeeName, profileType, gender, maritalStatus, panNo, emailId,
      currentAppointmentDate, currentAppointmentType,
      firstAppointmentDate, firstJoiningDate, firstAppointmentType,
      employeeType, approvalRefNo, approvalLetterDate, retirementDate,
      appointmentNature, qualifications, mobileNo, presentAddress,
      permanentAddress, branchName, branchRegionName, branchType,
      branchJoiningDate, designation, role
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    id,
    employeeData.hrmsNo,
    employeeData.employeeName,
    employeeData.profileType,
    employeeData.gender,
    employeeData.maritalStatus,
    employeeData.panNo,
    employeeData.emailId,

    formatDate(employeeData.currentAppointmentDate),
    employeeData.currentAppointmentType,

    formatDate(employeeData.firstAppointmentDate),
    formatDate(employeeData.firstJoiningDate),
    employeeData.firstAppointmentType,

    employeeData.employeeType,
    employeeData.approvalRefNo,
    formatDate(employeeData.approvalLetterDate),
    formatDate(employeeData.retirementDate),

    employeeData.appointmentNature,
    employeeData.qualifications,

    employeeData.mobileNo,
    employeeData.presentAddress,
    employeeData.permanentAddress,

    employeeData.branchName,
    employeeData.branchRegionName,
    employeeData.branchType,
    formatDate(employeeData.branchJoiningDate),

    employeeData.designation,
    employeeData.role || "user"
  ];

  const [result] = await pool.execute(query, values);
  return { id, affected: result.affectedRows };
};

// ------------------------------
// GET ALL EMPLOYEES
// ------------------------------
// export const getAllEmployees = async () => {
//   const [rows] = await pool.execute(`SELECT * FROM employees ORDER BY employeeName ASC`);
//   return rows;
// };
export const getAllEmployees = async () => {
  const [rows] = await pool.execute(`SELECT * FROM employees`);
  return rows || [];  // ensure array
};



// ------------------------------
// GET EMPLOYEE BY HRMS NO
// ------------------------------
export const getEmployeeByHRMSNo = async (hrmsNo) => {
  const [rows] = await pool.execute(`SELECT * FROM employees WHERE hrmsNo = ?`, [hrmsNo]);
  return rows[0] || null;
};

// ------------------------------
// UPDATE EMPLOYEE
// ------------------------------
export const updateEmployee = async (hrmsNo, updates) => {
  const columns = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      columns.push(`${key} = ?`);
      values.push(value);
    }
  }

  values.push(id);

  const query = `UPDATE employees SET ${columns.join(", ")} WHERE hrmsNo = ?`;

  const [result] = await pool.execute(query, values);
  return result;
};

// ------------------------------
// DELETE EMPLOYEE
// ------------------------------
export const deleteEmployee = async (hrmsNo) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Delete from employees table
    const [employeeResult] = await connection.execute(
      `DELETE FROM employees WHERE hrmsNo = ?`,
      [hrmsNo]
    );
    
    // Delete from wf_users table
    const [wfUserResult] = await connection.execute(
      `DELETE FROM wf_users WHERE hrmsNo = ?`,
      [hrmsNo]
    );
    
    await connection.commit();
    
    return { employeeResult, wfUserResult };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ------------------------------
// DATE FORMATTER
// ------------------------------
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

// // GET /employees/stats
// export const getEmployeeStats = async (req, res) => {
//   try {
//     const [total] = await pool.execute(`SELECT COUNT(*) AS totalUsers FROM employees`);
//     const [retiring] = await pool.execute(`
//       SELECT COUNT(*) AS retiringSoon
//       FROM employees
//       WHERE retirementDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
//     `);
//     const [benefited] = await pool.execute(`
//       SELECT COUNT(*) AS fullyBenefited
//       FROM employees
//       WHERE employeeType = 'Fully Benefited'
//     `);

//     res.json({
//       totalUsers: total[0].totalUsers,
//       retiringSoon: retiring[0].retiringSoon,
//       fullyBenefited: benefited[0].fullyBenefited,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getAdminStats = async (req, res) => {
//   try {

//     const [users] = await pool.execute(`SELECT COUNT(*) AS total FROM employees`);
//     const [retiring] = await pool.execute(`
//       SELECT COUNT(*) AS count
//       FROM employees
//       WHERE retirementDate IS NOT NULL
//       AND retirementDate <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)
//     `);
//     const [benefited] = await pool.execute(`
//       SELECT COUNT(*) AS count
//       FROM employees
//       WHERE employeeType = 'Fully-Benefited'
//     `);

//     res.json({
//       totalUsers: users[0].total,
//       retiringSoon: retiring[0].count,
//       fullyBenefited: benefited[0].count
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to load admin stats" });
//   }
// };