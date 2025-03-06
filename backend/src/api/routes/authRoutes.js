import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyUser,
  userLoginStatus,
  DeActiveAccount,
  ActiveAccount,
} from "../controllers/auth/authControllers.js";
//import UserController from "../controllers/user/userController.js";
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

// login status
router.get("/login-status", userLoginStatus);

// email verification
router.post("/verify-email", auth, verifyEmail);

// verify user --> email verification
router.post("/verify-user/:verificationToken", verifyUser);

// forgot password
router.post("/forgot-password", forgotPassword);

//reset password
router.post("/reset-password/:resetPasswordToken", resetPassword);

// change password ---> user must be logged in
router.put("/password", auth, changePassword);
router.put("/updateUser", auth, updateUser);
router.put("/DeActive-account", auth, DeActiveAccount);
router.put("/active-account", auth, ActiveAccount);

export default router;
