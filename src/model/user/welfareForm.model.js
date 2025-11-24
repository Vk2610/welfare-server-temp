import { pool } from '../../config/db.config.js';

// Create WF_User Table
const createWF_UserTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS WF_Users (
      user_id VARCHAR(255) PRIMARY KEY,
      hrmsNo varchar(255),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150),
      salary_per_month DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    await pool.execute(query);
    console.log("✅ WF_User table created");
};

// Create Patient Table
const createPatientTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS Patient (
      user_id VARCHAR(255),
      patient_id VARCHAR(255) PRIMARY KEY,
      patient_name VARCHAR(100) NOT NULL,
      relationship_with_user ENUM('Self', 'Spouse', 'Son', 'Daughter', 'Mother', 'Father') NOT NULL,
      type_of_disease VARCHAR(100),
      diagnosis_tenant VARCHAR(255),
      doctor_certificate ENUM('Yes', 'No') DEFAULT 'No',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES WF_Users(user_id)
    );
  `;
    await pool.execute(query);
    console.log("✅ Patient table created");
};

// Create MedicalExpenses Table
const medicalExpensesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS Medical_Expenses (
      id VARCHAR(255) PRIMARY KEY, 
      patient_id VARCHAR(255) NOT NULL,
      medicine_exp DECIMAL(10,2) DEFAULT 0.00,
      doctor_bill DECIMAL(10,2) DEFAULT 0.00,
      other_exp DECIMAL(10,2) DEFAULT 0.00,
      total_exp DECIMAL(10,2) GENERATED ALWAYS AS (medicine_exp + doctor_bill + other_exp) STORED,
      no_of_bill INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
    );
  `;
    await pool.execute(query);
    console.log("✅ MedicalExpenses table created");
};

// Create FundRequest Table
const fundRequestTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS Fund_Request (
      id VARCHAR(255),
      user_id VARCHAR(255) NOT NULL,
      req_fund_date DATE,
      req_fund_amt DECIMAL(10,2),
      app_fund_amt DECIMAL(10, 2) DEFAULT 0,
      form_status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
      is_fund_submitted ENUM('Yes','No') DEFAULT 'No',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES WF_Users(user_id)
    );
  `;
    await pool.execute(query);
    console.log("✅ FundRequest table created");
};

// Create PreviousFund Table
const previousFundTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS Previous_Fund (
      id VARCHAR(255),
      user_id VARCHAR(255) NOT NULL,
      req_fund_date DATE,
      req_fund_amt DECIMAL(10,2),
      form_status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
      is_fund_submitted ENUM('Yes','No') DEFAULT 'No',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES WF_Users(user_id)
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
  const query = `
    INSERT INTO WF_Users (user_id, hrmsNo, name, email, salary_per_month)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    formData.user_id,
    formData.hrmsNo,
    formData.name,
    formData.email,
    formData.salary_per_month
  ];
  await connection.execute(query, values);
};

// ---------------------------------------------------------
// 2️⃣ Insert into Patient
// ---------------------------------------------------------
const insertPatient = async (connection, formData) => {
  const query = `
    INSERT INTO Patient (patient_id, user_id, patient_name, relationship_with_user, type_of_disease, diagnosis_tenant, doctor_certificate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    formData.patient_id,
    formData.user_id,
    formData.patient_name,
    formData.relationship_with_user,
    formData.type_of_disease,
    formData.diagnosis_tenant,
    formData.doctor_certificate || "No"
  ];
  await connection.execute(query, values);
};

// ---------------------------------------------------------
// 3️⃣ Insert into Medical_Expenses
// ---------------------------------------------------------
const insertMedicalExpenses = async (connection, formData) => {
  const query = `
    INSERT INTO Medical_Expenses (id, patient_id, medicine_exp, doctor_bill, other_exp, no_of_bill)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    formData.expenses_id,
    formData.patient_id,
    formData.medicine_exp,
    formData.doctor_bill,
    formData.other_exp,
    formData.no_of_bill
  ];
  await connection.execute(query, values);
};

// ---------------------------------------------------------
// 4️⃣ Insert into Fund_Request
// ---------------------------------------------------------
const insertFundRequest = async (connection, formData) => {
  const query = `
    INSERT INTO Fund_Request (id, user_id, req_fund_date, req_fund_amt, form_status, is_fund_submitted)
    VALUES (?, ?, ?, ?, 'Pending', 'No')
  `;
  const values = [
    formData.fund_request_id,
    formData.user_id,
    formData.req_fund_date,
    formData.req_fund_amt
  ];
  await connection.execute(query, values);
};

// ---------------------------------------------------------
// 5️⃣ Insert into Previous_Fund (optional — only if data exists)
// ---------------------------------------------------------
const insertPreviousFund = async (connection, formData) => {
  if (!formData.prev_fund_used || formData.prev_fund_used === "No") return;

  const query = `
    INSERT INTO Previous_Fund (id, user_id, req_fund_date, req_fund_amt, form_status, is_fund_submitted)
    VALUES (?, ?, ?, ?, 'Pending', 'No')
  `;
  const values = [
    formData.prev_fund_id,
    formData.user_id,
    formData.fund_date,
    formData.total_funds_used
  ];
  await connection.execute(query, values);
};

// ---------------------------------------------------------
// 🌟 Master Transaction Controller
// ---------------------------------------------------------
export const insertWelfareFormData = async (req, res) => {
  const formData = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // await insertUser(connection, formData);
    await insertPatient(connection, formData);
    await insertMedicalExpenses(connection, formData);
    await insertFundRequest(connection, formData);
    await insertPreviousFund(connection, formData);

    await connection.commit();

    console.log("✅ All form data inserted successfully!");
    res.status(201).json({
      message: "✅ Welfare form submitted successfully",
      data: {
        user_id: formData.user_id,
        patient_id: formData.patient_id,
        expenses_id: formData.expenses_id,
        fund_request_id: formData.fund_request_id
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("❌ Transaction failed:", error);
    res.status(500).json({ error: "Transaction failed, all changes rolled back" });
  } finally {
    connection.release();
  }
};

export const updateStatus = async (id, status) => {

  const connection = await pool.getConnection();

  try {

    const query = `
      UPDATE INTO Fund_Request SET form_status = ? WHERE id = ?
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

    const query = `
      UPDATE INTO Fund_Request SET app_fund_amt = ? WHERE id = ?
    `;

    const values = [amt, id];

    await connection.execute(query, values);
  } catch (error) {
    console.error("Error occured while updating status: ", error);
    throw error;
  } finally {
    connection.release();
  }
}

export const getAllFormsOfUser = async (user_id) => {

  const connection = await pool.getConnection();

  try {
    const query = `
      SELECT 
        fr.id AS fund_req_id,
        fr.user_id,
        fr.req_fund_date,
        fr.req_fund_amt,
        fr.app_fund_amt,
        fr.form_status,
        fr.is_fund_submitted,
        fr.created_at,
        p.patient_id,
        p.patient_name,
        p.relationship_with_user,
        p.type_of_disease
      FROM Fund_Request fr
      JOIN Patient p ON fr.user_id = p.user_id
      WHERE fr.user_id = ?
      ORDER BY fr.created_at DESC
    `;
    const [rows] = await connection.execute(query, [user_id]);
    return rows;
  } catch (error) {
    console.error('Error retrieving forms of the user: ', error);
    throw error;
  } finally {
    connection.release();
  }
}

export const getUsers = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const connection = await pool.getConnection();
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const lim = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (pg - 1) * lim;
  const searchParam = `%${search.trim()}%`;

  try {
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM user_profile u
      WHERE u.name LIKE ? OR u.hrmsNo LIKE ?
    `;
    const [countRows] = await connection.execute(countQuery, [searchParam, searchParam]);
    const total = countRows[0]?.total ?? 0;

    const dataQuery = `
      SELECT 
        u.user_id,
        u.hrmsNo,
        u.name,
        u.email,
        u.salary_per_month,
        u.created_at
      FROM user_profile u
      WHERE u.name LIKE ? OR u.hrmsNo LIKE ?
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(dataQuery, [searchParam, searchParam, lim, offset]);

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

export const updateHRMSNo = async (mobileNo, hrmsNo) => {

  const connection = pool.getConnection();

  try {

    const query = `
      UPDATE INTO user_profile
      SET hrmsNo = ?
      WHERE mobileNo = ?
    `;

    const values = [ hrmsNo, mobileNo ];
    (await connection).execute(query, values);
  } catch (error) {
    console.error('Error updating user hrmsno: ', error);
    throw error;
  } finally {
    connection.release();
  }
}
