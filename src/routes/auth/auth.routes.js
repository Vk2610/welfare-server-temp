import express from 'express';
import { loginController, resetPasswordController } from '../../controller/auth/auth.controller.js';

const router = express.Router();

// Route to register a new user
router.post('/login', loginController);

// Route to reset user password
router.post('/reset-password', resetPasswordController);    

export default router;