import express from "express";
import { pool } from "../../config/db.config.js";   // ✅ FIX: pool must be imported
import { 
  getFundsByHRMS,
  updateInstallments,
  createFundRecord
} from "../../model/user/funds.model.js";

const router = express.Router();

/* -------------------------------------------------------
   GET FUNDS BY HRMSNO
---------------------------------------------------------*/
router.get("/:hrmsNo", async (req, res) => {
  try {
    const hrmsNo = req.params.hrmsNo;

    const fund = await getFundsByHRMS(hrmsNo);

    if (!fund) {
      await createFundRecord(hrmsNo);
      return res.json({
        installment1: 0, installment1Date: null,
        installment2: 0, installment2Date: null,
        installment3: 0, installment3Date: null,
        installment4: 0, installment4Date: null,
        installment5: 0, installment5Date: null,
        claimedFullAmount: false
      });
    }

    res.json(fund);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


/* -------------------------------------------------------
   UPDATE INSTALLMENTS
---------------------------------------------------------*/
router.put("/upd-ints/:hrmsNo", async (req, res) => {
  try {
    const hrmsNo = req.params.hrmsNo;

    console.log("📝 PUT update funds for HRMS:", hrmsNo);
    console.log("🔥 Received update payload:", req.body);

    const {
      installment1, installment1Date,
      installment2, installment2Date,
      installment3, installment3Date,
      installment4, installment4Date,
      installment5, installment5Date,
      claimedFullAmount
    } = req.body;

    const result = await updateInstallments(hrmsNo, {
      installment1,
      installment1Date,
      installment2,
      installment2Date,
      installment3,
      installment3Date,
      installment4,
      installment4Date,
      installment5,
      installment5Date,
      claimedFullAmount
    });

    res.json({ success: true, updated: result });

  } catch (err) {
    console.error("PUT /funds error:", err);
    res.status(500).json({ error: "Server error updating installments" });
  }
});

export default router;