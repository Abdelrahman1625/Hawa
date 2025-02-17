import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from './api/middlewares/auth.js';
import { authorize } from './api/middlewares/auth.js';
import connectDB from './config/database.js';
import authRoutes from './api/routes/authRoutes.js';
import userRoutes from './api/routes/userRoutes.js';
import rideRoutes from './api/routes/rideRoutes.js';
import paymentRoutes from './api/routes/paymentRoutes.js';
import reviewRoutes from './api/routes/reviewRoutes.js';
import adminRoutes from './api/routes/adminRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use(cors());
const router = express.Router();

// Routes
app.use('/api/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rides', rideRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

// Protected Routes
app.use('/api/admin', auth, authorize('admin'), adminRoutes);
app.use('/api/rides', auth, rideRoutes);
app.use('/api/payments', auth, paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});