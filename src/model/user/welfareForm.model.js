import { pool } from '../../config/db.config.js';
import createEmployeesTable from './employees.model.js';
import { createFundsTable } from './funds.model.js';
import { createWelfareDocsTable, insertWelfareDocsIntoDB } from './welfareDocs.model.js';

// Create WF_User Table
const createWF_UserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS wf_users (
      hrmsNo VARCHAR(20) PRIMARY KEY,
      applicantName VARCHAR(100) NOT NULL,
      branchName VARCHAR(100),
      joiningDate VARCHAR(100),
      designation VARCHAR(100),
      totalService VARCHAR(100),
      monthlySalary DECIMAL(10,2),
      mobileNo VARCHAR(15),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.execute(query);
  console.log("✅ WF_User table created");
};

// Create Patient Table
const createPatientTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS patient (
      patientId VARCHAR(255) PRIMARY KEY,
      hrmsNo VARCHAR(20) NOT NULL,
      patientName VARCHAR(100) NOT NULL,
      relation ENUM('Self', 'Spouse', 'Son', 'Daughter', 'Mother', 'Father') NOT NULL,
      illnessNature VARCHAR(200) NOT NULL,
      illnessDuration VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hrmsNo) REFERENCES wf_users(hrmsNo)
    );
  `;
  await pool.execute(query);
  console.log("✅ Patient table created");
};

// Create MedicalExpenses Table
const medicalExpensesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS medical_expenses (
      expenseId VARCHAR(255) PRIMARY KEY,
      hrmsNo VARCHAR(20) NOT NULL,
      medicineBill DECIMAL(10,2) DEFAULT 0.00,
      doctorBill DECIMAL(10,2) DEFAULT 0.00,
      otherExpenses DECIMAL(10,2) DEFAULT 0.00,
      totalExpenses DECIMAL(10,2) DEFAULT 0.0,
      certificatesAttached VARCHAR(50) DEFAULT 'होय',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hrmsNo) REFERENCES wf_users(hrmsNo)
    );
  `;
  await pool.execute(query);
  console.log("✅ MedicalExpenses table created");
};

// Create FundRequest Table
const fundRequestTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS fund_request (
      requestId VARCHAR(255) PRIMARY KEY,
      hrmsNo VARCHAR(20) NOT NULL,
      requestedAmountNumbers DECIMAL(10,2),
      requestedAmountWords VARCHAR(255),
      branchNameForDeposit VARCHAR(255),
      savingsAccountNo VARCHAR(30),
      officerRecommendation VARCHAR(300),
      applicantSignature TEXT NOT NULL,
      approvedAmount DECIMAL(10,2) DEFAULT 0.0,
      formDate VARCHAR(100) NOT NULL,
      formStatus ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hrmsNo) REFERENCES wf_users(hrmsNo)
    );
  `;
  await pool.execute(query);
  console.log("✅ FundRequest table created");
};

// Create PreviousFund Table
const previousFundTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS previous_fund (
      previousId VARCHAR(255) PRIMARY KEY,
      hrmsNo VARCHAR(20) NOT NULL,
      previousHelpDetails VARCHAR(255),
      annualDeductions VARCHAR(50) DEFAULT 'होय',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hrmsNo) REFERENCES wf_users(hrmsNo)
    );
  `;
  await pool.execute(query);
  console.log("✅ PreviousFund table created");
};

// Run all table creations
export const createAllTables = async () => {
  try {
    await createWF_UserTable();
    await createPatientTable();
    await medicalExpensesTable();
    await fundRequestTable();
    await previousFundTable();
    await createWelfareDocsTable();
    await createEmployeesTable();
    await createFundsTable();
    console.log("🎉 All tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};



export {
  createWF_UserTable,
  createPatientTable,
  medicalExpensesTable,
  fundRequestTable,
  previousFundTable
};


// ---------------------------------------------------------
// 1️⃣ Insert into WF_Users
// ---------------------------------------------------------
const insertUser = async (connection, formData) => {
  try {

    const checkUserQuery = `
      SELECT applicantName FROM wf_users WHERE hrmsNo = ?
    `;

    const rows = await connection.execute(checkUserQuery, [formData.hrmsNo]);

    if (rows[0].length !== 0) {
      console.log('wf user already exists');
      return;
    }

    const query = `
    INSERT INTO wf_users (
      hrmsNo, applicantName, branchName, joiningDate, designation,
      totalService, monthlySalary, mobileNo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const values = [
      formData.hrmsNo,
      formData.applicantName,
      formData.branchName,
      formData.joiningDate,
      formData.designation,
      formData.totalService,
      formData.monthlySalary,
      formData.mobileNo
    ];

    await connection.execute(query, values);
  } catch (error) {
    console.log('error at insertUser: ', error);
    throw error;
  }
};


// ---------------------------------------------------------
// 2️⃣ Insert into Patient
// ---------------------------------------------------------
const insertPatient = async (connection, formData) => {
  try {
    const query = `
    INSERT INTO patient (
      patientId, hrmsNo, patientName, relation, illnessNature, illnessDuration
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

    const values = [
      formData.patientId,
      formData.hrmsNo,
      formData.patientName,
      formData.relation,
      formData.illnessNature,
      formData.illnessDuration
    ];

    await connection.execute(query, values);
  } catch (error) {
    console.log('error at insertPatient: ', error);
    throw error;
  }
};

// ---------------------------------------------------------
// 3️⃣ Insert into Medical_Expenses
// ---------------------------------------------------------
const insertMedicalExpenses = async (connection, formData) => {
  try {
    const query = `
      INSERT INTO medical_expenses (
        expenseId, hrmsNo, medicineBill, doctorBill, otherExpenses, totalExpenses, certificatesAttached
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      formData.expensesId,
      formData.hrmsNo,
      formData.medicineBill,
      formData.doctorBill,
      formData.otherExpenses,
      formData.totalExpenses,
      formData.certificatesAttached
    ];

    await connection.execute(query, values);
  } catch (error) {
    console.log('error at insertMedicalExpenses: ', error);
    throw error;
  }
};


// ---------------------------------------------------------
// 4️⃣ Insert into Fund_Request
// ---------------------------------------------------------
const insertFundRequest = async (connection, formData) => {
  try {
    const query = `
    INSERT INTO fund_request (
      requestId, hrmsNo, requestedAmountNumbers, requestedAmountWords,
      branchNameForDeposit, savingsAccountNo, officerRecommendation,
      applicantSignature, formDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const values = [
      formData.requestId,
      formData.hrmsNo,
      formData.requestedAmountNumbers,
      formData.requestedAmountWords,
      formData.branchNameForDeposit,
      formData.savingsAccountNo,
      formData.officerRecommendation,
      formData.applicantSignature,
      formData.formDate
    ];

    await connection.execute(query, values);
  } catch (error) {
    console.log('error at insertFundRequest: ', error);
    throw error;
  }
};


// ---------------------------------------------------------
// 5️⃣ Insert into Previous_Fund (optional — only if data exists)
// ---------------------------------------------------------
const insertPreviousFund = async (connection, formData) => {

  if (!formData.previousHelp || formData.previousHelp === 'नाही') {
    console.log("no previous fund, no prevfund record inserted");
    return;
  }

  try {
    const query = `
    INSERT INTO previous_fund (
      previousId, hrmsNo, previousHelpDetails,
      annualDeductions
    ) VALUES (?, ?, ?, ?)
  `;

    const values = [
      formData.previousId,
      formData.hrmsNo,
      formData.previousHelpDetails,
      formData.annualDeductions
    ];

    await connection.execute(query, values);
  } catch (error) {
    console.log('error at insertPreviousFund: ', error);
    throw error;
  }
};


// ---------------------------------------------------------
// 🌟 Master Transaction Controller
// ---------------------------------------------------------
export const insertWelfareFormData = async (req, res) => {
  const formData = req.body;
  const connection = await pool.getConnection();

  try {

    await connection.beginTransaction();

    await insertUser(connection, formData);
    await insertPatient(connection, formData);
    await insertMedicalExpenses(connection, formData);
    await insertFundRequest(connection, formData);
    await insertPreviousFund(connection, formData);
    await insertWelfareDocsIntoDB(connection, formData);

    await connection.commit();

    console.log("✅ All form data inserted successfully!");
    return res.status(201).json({
      message: "✅ Welfare form submitted successfully"
    });

  } catch (error) {
    await connection.rollback();
    console.error("❌ Transaction failed:", error);
    return res.status(500).json({ error: "Transaction failed, all changes rolled back" });
  } finally {
    connection.release();
  }
};

export const updateStatus = async (id, status) => {

  const connection = await pool.getConnection();

  try {

    const query = `
      UPDATE fund_request SET formStatus = ? WHERE requestId = ?
    `;

    const values = [status, id];

    await connection.execute(query, values);
  } catch (error) {
    console.error("Error occured while updating status: ", error);
    throw error;
  } finally {
    connection.release();
  }
}

export const updateApprAmt = async (id, amt) => {

  const connection = await pool.getConnection();

  try {

    const amount = Number(amt);
    const query = `
      UPDATE fund_request SET approvedAmount = ? WHERE requestId = ?
    `;

    const values = [amount, id];

    await connection.execute(query, values);
  } catch (error) {
    console.error("Error occured while updating status: ", error);
    throw error;
  } finally {
    connection.release();
  }
}

export const getAllForms = async ({ page = 1, limit = 10 } = {}) => {
  const connection = await pool.getConnection();
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const lim = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (pg - 1) * lim;

  console.log("lim type:", typeof lim, "offset type:", typeof offset);


  try {
    // Count total pending forms
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM fund_request
      WHERE formStatus = 'Pending'
    `;
    const [countRows] = await connection.execute(countQuery);
    const total = countRows[0]?.total ?? 0;

    // Fetch pending forms
    const dataQuery = `
      SELECT
        wf.applicantName,
        fr.requestId,
        fr.hrmsNo,
        fr.requestedAmountNumbers,
        fr.requestedAmountWords,
        fr.branchNameForDeposit,
        fr.formDate,
        fr.formStatus,
        fr.created_at,

        p.patientId,
        p.patientName,
        p.relation,
        p.illnessNature,
        p.illnessDuration

      FROM fund_request fr
      JOIN patient p 
        ON fr.hrmsNo = p.hrmsNo
      JOIN wf_users wf 
        ON fr.hrmsNo = wf.hrmsNo

      WHERE fr.formStatus = 'Pending'
      ORDER BY fr.created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;

    const [rows] = await connection.execute(dataQuery, [lim, offset]);


    return {
      total,
      page: pg,
      limit: lim,
      forms: rows
    };
  } catch (error) {
    console.error("Error retrieving forms: ", error);
    throw error;
  } finally {
    connection.release();
  }
};


export const getAllFormsOfUser = async (hrmsNo) => {
  const connection = await pool.getConnection();

  try {
    const query = `
      SELECT 
        fr.requestId,
        u.applicantName,
        fr.hrmsNo,
        fr.requestedAmountNumbers,
        fr.approvedAmount,
        fr.formDate,
        fr.formStatus,
        fr.created_at,

        p.patientId,
        p.patientName,
        p.relation,
        p.illnessNature
      FROM fund_request fr
      JOIN patient p ON fr.hrmsNo = p.hrmsNo
      JOIN wf_users u ON fr.hrmsNo = u.hrmsNo
      WHERE fr.hrmsNo = ?
      ORDER BY fr.created_at DESC
    `;

    const [rows] = await connection.execute(query, [hrmsNo]);
    return rows;

  } catch (error) {
    console.error('Error retrieving forms of the user: ', error);
    throw error;
  } finally {
    connection.release();
  }
};


export const getUsers = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const connection = await pool.getConnection();
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const lim = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (pg - 1) * lim;
  const searchParam = `%${search.trim()}%`;

  try {

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM wf_users u
      WHERE u.applicantName LIKE ? OR u.hrmsNo LIKE ?
    `;
    const [countRows] = await connection.execute(countQuery, [searchParam, searchParam]);
    const total = countRows[0]?.total ?? 0;

    const dataQuery = `
      SELECT 
        u.hrmsNo,
        u.applicantName,
        u.created_at
      FROM wf_users u
      WHERE u.applicantName LIKE ? OR u.hrmsNo LIKE ?
      ORDER BY u.created_at DESC
      LIMIT ${lim} OFFSET ${offset}
    `;
    const [rows] = await connection.execute(dataQuery, [searchParam, searchParam]);

    return {
      total,
      page: pg,
      limit: lim,
      users: rows
    };

  } catch (error) {
    console.error('Error retrieving paginated users:', error);
    throw error;
  } finally {
    connection.release();
  }
};
