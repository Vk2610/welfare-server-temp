import { pool } from "../../config/db.config.js";

// ------------------------------------------
// CREATE FUNDS TABLE (foreign key = hrmsNo)
// ------------------------------------------
export async function createFundsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS funds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hrmsNo VARCHAR(20) NOT NULL,

    installment1 DECIMAL(10,2) DEFAULT 0,
    installment1Date DATETIME NULL,

    installment2 DECIMAL(10,2) DEFAULT 0,
    installment2Date DATETIME NULL,

    installment3 DECIMAL(10,2) DEFAULT 0,
    installment3Date DATETIME NULL,

    installment4 DECIMAL(10,2) DEFAULT 0,
    installment4Date DATETIME NULL,

    installment5 DECIMAL(10,2) DEFAULT 0,
    installment5Date DATETIME NULL,

    claimedFullAmount BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (hrmsNo) REFERENCES employees(hrmsNo)
      ON DELETE CASCADE
      ON UPDATE CASCADE
  );
  `;

  await pool.execute(query);
  console.log("✅ funds table created successfully");
}

createFundsTable();


export async function createFundRecord(hrmsNo) {
  const query = `
    INSERT INTO funds (hrmsNo)
    VALUES (?)
  `;

  await pool.execute(query, [hrmsNo]);
  return { success: true };
}


export async function updateInstallments(hrmsNo, data) {
  const {
    installment1, installment1Date,
    installment2, installment2Date,
    installment3, installment3Date,
    installment4, installment4Date,
    installment5, installment5Date,
    claimedFullAmount
  } = data;

  const query = `
    UPDATE funds 
    SET 
      installment1 = ?, installment1Date = ?,
      installment2 = ?, installment2Date = ?,
      installment3 = ?, installment3Date = ?,
      installment4 = ?, installment4Date = ?,
      installment5 = ?, installment5Date = ?,
      claimedFullAmount = ?
    WHERE hrmsNo = ?
  `;

  const values = [
    installment1, installment1Date,
    installment2, installment2Date,
    installment3, installment3Date,
    installment4, installment4Date,
    installment5, installment5Date,
    claimedFullAmount,
    hrmsNo
  ];

  const [result] = await pool.execute(query, values);
  return result;
}



export async function getFundsByHRMS(hrmsNo) {
  const [rows] = await pool.execute(`SELECT * FROM funds WHERE hrmsNo = ?`, [hrmsNo]);
  return rows[0] || null;
}



export async function getEmployeesWithFunds() {
  const query = `
    SELECT 
      e.*,
      f.installment1,
      f.installment2,
      f.installment3,
      f.installment4,
      f.installment5,
      f.totalAmount,
      f.claimedFullAmount
    FROM employees e
    LEFT JOIN funds f 
    ON e.hrmsNo = f.hrmsNo
    ORDER BY e.employeeName ASC
  `;

  const [rows] = await pool.execute(query);
  return rows;
}

