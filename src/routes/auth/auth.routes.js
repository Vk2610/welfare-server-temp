import express from 'express';
import { registerUser, LoginUser, resetPassword,} from '../../controller/auth/auth.controller.js';
// import authenticateToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', LoginUser);
router.put('/reset-password', resetPassword);
// router.post('/updatePassword',authenticateToken, updatePassword);

// router.put('/updatePassword', authenticateToken, updatePassword);


export default router;
