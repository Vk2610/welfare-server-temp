import { pool } from '../../config/db.config.js';

// Create welfareDocs table

export const createWelfareDocsTable = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS welfareDocs (
    id varchar(255),
    discharge_certificate varchar(255),
    doctor_prescription varchar(255),
    medicine_bills varchar(255),
    diagnostic_reports varchar(255),
    otherDoc1 varchar(255) NULL,
    otherDoc2 varchar(255) NULL,
    otherDoc3 varchar(255) NULL,
    otherDoc4 varchar(255) NULL,
    otherDoc5 varchar(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
  await pool.execute(query);
  console.log("✅ welfareDocs table created");
};

export const insertWelfareDocs = async (docs) => {
  // Destructure with default values of null for optional fields
  const {
    id,
    discharge_certificate,
    doctor_prescription,
    medicine_bills,
    diagnostic_reports,
    otherDoc1 = null,
    otherDoc2 = null,
    otherDoc3 = null,
    otherDoc4 = null,
    otherDoc5 = null
  } = docs || {};

  // Validate required field
  if (!id) {
    throw new Error('Document ID is required');
  }

  const query = `
    INSERT INTO welfareDocs (id, discharge_certificate, doctor_prescription, medicine_bills, diagnostic_reports,
        otherDoc1, otherDoc2, otherDoc3, otherDoc4, otherDoc5)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id,
    discharge_certificate,
    doctor_prescription,
    medicine_bills,
    diagnostic_reports,
    otherDoc1,
    otherDoc2,
    otherDoc3,
    otherDoc4,
    otherDoc5
  ];

  try {
    await pool.execute(query, values);
    console.log("✅ Welfare documents inserted successfully");
  } catch (error) {
    console.error("❌ Error inserting welfare documents:", error);
    throw error;
  }
};

// retrieve welfare documents by id
export const getWelfareDocsById = async (id) => {
  const query = `
    SELECT * FROM welfareDocs WHERE id = ?
  `;

  try {
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  } catch (error) {
    console.error("❌ Error retrieving welfare documents:", error);
    throw error;
  }
};

