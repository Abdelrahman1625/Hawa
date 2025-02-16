import express from 'express';
import { userController } from '../controllers/userControllers.js';
import { authenticate } from '../middlewares/auth.js';
import { validateUserCreation, validateProfileUpdate } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserCreation, userController.createUser);

// Protected routes
router.use(authenticate);
router.get('/profile', userController.getProfile);
router.put('/profile', validateProfileUpdate, userController.updateProfile);
router.put('/password', userController.changePassword);
router.delete('/deactivate', userController.deactivateAccount);

export default router;