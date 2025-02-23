import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
} from "../controllers/auth/authControllers.js";
import UserController from "../controllers/user/userController.js";
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
router.put("/password", auth, UserController.changePassword);
router.delete("/deactivate", auth, UserController.deactivateAccount);
router.get(
  "/admin/users",
  auth,
  adminMiddleware("admin"),
  requireVerified,
  getAllUsers
);



// admin route
router.delete("/admin/users/:id", auth, adminMiddleware, deleteUser);

// get all users
router.get("/admin/users", auth, requireVerified, getAllUsers);

export default router;
