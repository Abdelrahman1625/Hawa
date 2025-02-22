import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Customer } from "../models/customer.js";
import { Driver } from "../models/driver.js";
import { Admin } from "../models/admin.js";

// Protect routes middleware
export const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies first (preferred)
    token = req.cookies.token;
    
    // Fallback to Authorization header if no cookie
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get base user first to determine type
    const baseUser = await User.findOne({ 
      _id: decoded.userId,
      is_active: true 
    }).select("-password_hash");

    if (!baseUser) {
      res.status(401);
      throw new Error("User not found or account inactive");
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
        throw new Error("Invalid user type");
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token validation failed");
  }
});

// Role-based authorization middleware
export const authorize = (...allowedTypes) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !allowedTypes.includes(req.user.user_type)) {
      res.status(403);
      throw new Error(`Access denied. ${req.user?.user_type || 'Unknown'} not authorized.`);
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

// Active account middleware
export const requireActive = asyncHandler(async (req, res, next) => {
  if (!req.user.is_active) {
    res.status(403);
    throw new Error("Account is not active");
  }
  next();
});

// Driver specific middleware
export const requireActiveDriver = asyncHandler(async (req, res, next) => {
  if (req.user.user_type !== 'driver') {
    res.status(403);
    throw new Error("This route is only for drivers");
  }
  
  if (req.user.account_status !== 'active') {
    res.status(403);
    throw new Error("Driver account is not active");
  }
  next();
});

// Admin level middleware
export const requireAdminLevel = (...allowedLevels) => {
  return asyncHandler(async (req, res, next) => {
    if (req.user.user_type !== 'admin' || !allowedLevels.includes(req.user.admin_level)) {
      res.status(403);
      throw new Error("Insufficient admin privileges");
    }
    next();
  });
};