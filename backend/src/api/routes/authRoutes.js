import express from 'express';
import { register, login, logout, getProfile } from '../controllers/auth/authController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);

export default router;