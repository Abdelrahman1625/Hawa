import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { auth, authorize } from './api/middlewares/auth.js';
import connectDB from './config/database.js';
import authRoutes from './api/routes/authRoutes.js';

import userRoutes from './api/routes/userRoutes.js';
import rideRoutes from './api/routes/rideRoutes.js';
import paymentRoutes from './api/routes/paymentRoutes.js';
import reviewRoutes from './api/routes/reviewRoutes.js';
import adminRoutes from './api/routes/adminRoutes.js';


dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Ensure req.body is parsed properly
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Protected Routes
//app.use('/api/admin', auth, authorize('admin'), adminRoutes);
//app.use('/api/rides', auth, rideRoutes);
//app.use('/api/payments', auth, paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
