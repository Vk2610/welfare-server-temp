import express from "express";
import { getForms, getFormsOfUser, getUsersController, updateFormApprovalAmt, updateFormStatus } from "../../controller/user/welfareForm.controller.js";
import { getWelfareDocs } from "../../controller/user/welfareDocs.controller.js";

const route = express.Router();

route.patch('/update-form-status', updateFormStatus);
route.patch('/update-appr-amt', updateFormApprovalAmt);
route.get('/get-all-forms', getForms);
route.get('/get-user-forms', getFormsOfUser);
route.get('/get-users', getUsersController);
route.get('/get-docs', getWelfareDocs)

export default route;