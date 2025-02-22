// import jwt from 'jsonwebtoken';
// import { User } from '../models/user.js';

// const JWT_SECRET = process.env.JWT_SECRET;

// export const auth = async (req, res, next) => {
//     try{
//         const token = req.header('Authorization')?.replace('Bearer ', '');

//         if(!token){
//             throw new Error('No authentication token provided');
//         }

//         const decoded = jwt.verify(token, JWT_SECRET);
//         const user = await User.findOne({_id: decoded.userId, is_active: true });

//         if(!user){
//             throw new Error('User not found');
//         }

//         req.user = user;
//         req.token = token;
//         next();
//     } catch (error){
//         res.status(401).json({error: 'Authentication failed. Please log in again.', error});
//     }
// };

// //role-based authentication middleware
// // export const authorize = (...roles) => {
// //     return (req, res, next) => {
// //         if(!roles.includes(req.user.user_type)) {
// //             return res.status(403).json({
// //                 error: 'Unauthorized access. You do not have the required permissions'
// //             });
// //         }
// //         next();
// //     };
// // };

// export const authorize = (req, res, next) => {
//     if (!req.headers || !req.headers.authorization) {
//       return res.status(401).json({ message: "Authorization header is missing" });
//     }

//     const authHeader = req.headers.authorization;
//     if (!authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Invalid token format" });
//     }

//     const token = authHeader.split(" ")[1];
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded; // Attach user data
//       next();
//     } catch (err) {
//       return res.status(403).json({ message: "Invalid or expired token" });
//     }
// };

import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Customer } from '../models/customer.js';
import { Driver } from '../models/driver.js';
import { Admin } from '../models/admin.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Improved Authentication Middleware
export const auth = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first (preferred)
    token = req.cookies.token;

    // Fallback to Authorization header if no cookie
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, please login" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get base user to determine type
    const baseUser = await User.findOne({
      _id: decoded.userId,
      is_active: true,
    }).select("-password_hash");

    if (!baseUser) {
      return res.status(401).json({ message: "User not found or account inactive" });
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
      return res.status(404).json({ message: `${baseUser.user_type} not found` });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401)
      .json({ message: "Token expired, please log in again" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401)
      .json({ message: "Invalid token" , error: error.message});
    } else {
      return res.status(401)
      .json({ message: "Not authorized, token validation failed", error: error.message });
    }
  }
});

// ✅ Role-Based Authorization Middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.user_type)) {
      return res
        .status(403)
        .json({ error: "Unauthorized access. Insufficient permissions." });
    }
    next();
  };
};
