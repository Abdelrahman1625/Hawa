import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
} from "../controllers/auth/authControllers.js";

import { auth, adminMiddleware, requireVerified } from "../middlewares/auth.js";

import {
  deleteUser,
  getAllUsers,
} from "../controllers/admin/adminController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/user", auth, getUser);
router.patch("/user", auth, updateUser);

// admin route
router.delete("/admin/users/:id", auth, adminMiddleware, deleteUser);

// get all users
router.get("/admin/users", auth, requireVerified, getAllUsers);

export default router;
