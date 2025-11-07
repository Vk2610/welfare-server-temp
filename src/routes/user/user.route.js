import express from "express";
import { submitWelfareForm } from "../../controller/user/welfareForm.controller.js";
import { uploadWelfareDocs, fetchWelfareDocs } from "../../controller/user/welfareDocs.controller.js";  
const router = express.Router();

router.post("/submit-welfare-form", submitWelfareForm);
router.post("/upload-welfare-docs", uploadWelfareDocs);
router.get("/fetch-welfare-docs/:id", fetchWelfareDocs);

export default router;