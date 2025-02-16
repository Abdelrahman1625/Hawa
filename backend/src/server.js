import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './api/routes/authRoutes.js';
import { auth } from '../../backend/src/api/middlewares/auth.js';
import { authorize } from './api/middlewares/auth.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected Routes
//app.use('/api/admin', auth, authorize('admin'), adminRoutes);
//app.use('/api/rides', auth, rideRoutes);
//app.use('/api/payments', auth, paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});