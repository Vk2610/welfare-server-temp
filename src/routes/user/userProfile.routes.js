import express from 'express';
import { createUserProfile, getUserProfile, updateUserProfileController } from '../../controller/user/userProfile.controller.js';

const router = express.Router();

// Route to create a user profile
router.post('/', createUserProfile);

// Route to get a user profile by ID
router.get('/:id', getUserProfile);

// Route to update a user profile
router.put('/:id', updateUserProfileController);

export default router;