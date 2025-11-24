import express from "express";
import { getFormsOfUser, getUsersController, updateFormApprovalAmt, updateFormStatus } from "../../controller/user/welfareForm.controller.js";

const route = express.Router();

route.patch('/update-form-status', updateFormStatus);
route.patch('/update-appr-amt', updateFormApprovalAmt);
route.get('/get-all-forms', getFormsOfUser);
route.get('/get-users', getUsersController);

export default route;