import express from "express";
import { adminMiddleware, auth } from "../middlewares/auth.js";
import { validateAdminActions } from "../middlewares/validator.js";
import {
  deleteUser,
  getAllUsers,
  updateDriverStatus,
  getSystemStats,
  manageProfitPercentage,
} from "../controllers/admin/adminController.js";

const router = express.Router();

// Require authentication and admin authorization for all routes
router.use(adminMiddleware, auth);

router.put("/drivers/:id/status", validateAdminActions, updateDriverStatus);
router.get("/stats", getSystemStats);
router.put("/profit-percentage", validateAdminActions, manageProfitPercentage);

router.delete("/users/:id", deleteUser);
router.get("/users", getAllUsers);

export default router;
