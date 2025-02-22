import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import cookieParser from 'cookie-parser';
import { User } from "../../models/user.js";
import { Customer } from "../../models/customer.js";
import { Driver } from "../../models/driver.js";
import { Admin } from "../../models/admin.js";
import Token from '../../models/Token.js';
import hashToken from "../../../helpers/hashToken.js";


const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper to set cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "none",
    secure: true,
  });
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
};

//Register user
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      user_type,
      ...additionalInfo
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or phone already exists",
      });
    }

    // create user based on user_type
    let user;
    const userData = {
      name,
      email,
      password_hash: password, //will be hashed by pre-save hook
      phone,
      address,
      user_type,
    };

    switch (user_type) {
      case "customer":
        user = new Customer({
          ...userData,
          loyalty_points: 0,
          wallet_balance: 0,
        });
        break;
      case "driver":
        if (!additionalInfo.license_number || !additionalInfo.vehicle_info) {
          return res.status(400).json({
            error: "License number and vehicle info are required for drivers",
          });
        }
        user = new Driver({
          ...userData,
          ...additionalInfo,
          account_status: "inactive",
        });
        break;
      case "admin":
        if (!additionalInfo.admin_level) {
          return res.status(400).json({
            error: "Admin level is required",
          });
        }
        user = new Admin({
          ...userData,
          ...additionalInfo,
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid user type" });
    }

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!user.is_active) {
    res.status(401);
    throw new Error("Account is deactivated");
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    user_type: user.user_type,
    isVerified: user.isVerified,
    token,
  });
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// Get User Profile
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password_hash");
  
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update User Profile
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, phone, address } = req.body;
  
  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.address = address || user.address;

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
    user_type: updatedUser.user_type,
  });
});

// verify user
export const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status(400).json({ message: "Invalid verification token" });
  }
  // hash the verification token --> because it was hashed before saving
  const hashedToken = hashToken(verificationToken);

  // find user with the verification token
  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    // check if the token has not expired
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification token" });
  }

  //find user with the user id in the token
  const user = await User.findById(userToken.userId);

  if (user.isVerified) {
    // 400 Bad Request
    return res.status(400).json({ message: "User is already verified" });
  }

  // update user to verified
  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "User verified" });
});
