import express from "express";
//import AdminController from "../controllers/admin/adminController.js";
import { adminMidddleware , auth } from "../middlewares/auth.js";
import { validateAdminActions } from "../middlewares/validator.js";
import {
  deleteUser,
  getAllUser,
} from "../controllers/admin/adminController.js";

const router = express.Router();

// Require authentication and admin authorization for all routes
router.use( adminMiddleware, auth);

router.put(
  "/drivers/:id/status",
  validateAdminActions,
  AdminController.updateDriverStatus
);
router.get("/stats", AdminController.getSystemStats);
router.put(
  "/profit-percentage",
  validateAdminActions,
  AdminController.manageProfitPercentage
);
// router.get('/users', adminController.getAllUsers);
// router.get('/payments', adminController.getAllPayments);
// router.get('/rides', adminController.getAllRides);
// router.put('/users/:id/status', adminController.updateUserStatus);

export default router;
