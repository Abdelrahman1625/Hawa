import express from 'express';
import UserController from '../controllers/user/userController.js';
import { authorize } from '../middlewares/auth.js';
import { validateUserCreation, validateProfileUpdate } from '../middlewares/validator.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserCreation, UserController.createUser);

// Protected routes
router.use(authorize);
router.get('/profile', UserController.getProfile);
router.put('/profile', validateProfileUpdate, UserController.updateProfile);
//router.put('/password', UserController.changePassword);
//router.delete('/deactivate', UserController.deactivateAccount);

export default router;