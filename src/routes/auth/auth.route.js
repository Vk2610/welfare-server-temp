const express = require('express');
const router = express.Router();
const { resetPassword } = require('../../controller/auth/auth.controller');

// Reset password route
router.post('/reset-password', resetPassword);

export default router;