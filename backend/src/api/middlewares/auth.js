import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Customer } from "../models/customer.js";
import { Driver } from "../models/driver.js";
import { Admin } from "../models/admin.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Improved Authentication Middleware
export const auth = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first (preferred)
    token = req.cookies.token;

    // Fallback to Authorization header if no cookie
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, please login" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get base user to determine type
    const baseUser = await User.findOne({
      _id: decoded.userId,
      // Skip is_active check for activation endpoint
      ...(req.path !== "/active-account" && { is_active: true }),
    }).select("-password_hash");

    if (!baseUser) {
      return res
        .status(401)
        .json({ message: "User not found or account inactive" });
    }

    // Get specific user type model
    let user;
    switch (baseUser.user_type) {
      case "customer":
        user = await Customer.findById(baseUser._id).select("-password_hash");
        break;
      case "driver":
        user = await Driver.findById(baseUser._id).select("-password_hash");
        break;
      case "admin":
        user = await Admin.findById(baseUser._id).select("-password_hash");
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ message: `${baseUser.user_type} not found` });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please log in again" });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token", error: error.message });
    } else {
      return res.status(401).json({
        message: "Not authorized, token validation failed",
        error: error.message,
      });
    }
  }
});

// Role-based authorization middleware
export const adminMiddleware = (...allowedTypes) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !allowedTypes.includes(req.user.user_type)) {
      res.status(403);
      throw new Error(
        `Access denied. ${req.user?.user_type || "Unknown"} not authorized.`
      );
    }
    next();
  });
};

// Verified email middleware
export const requireVerified = asyncHandler(async (req, res, next) => {
  if (!req.user.isVerified) {
    res.status(403);
    throw new Error("Please verify your email address first");
  }
  next();
});
