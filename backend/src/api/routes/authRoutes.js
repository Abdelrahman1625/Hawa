import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  verifyEmail,
  changePassword,
} from "../controllers/auth/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { Router } from 'express';

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected routes
router.get("/profile", protect, getUser);
router.put("/update", protect, updateUser);
router.post("/verify-email", protect, verifyEmail);
router.post("/change-password", protect, changePassword);

export default router;