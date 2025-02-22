import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../../models/user.js";
import { Customer } from "../../models/customer.js";
import { Driver } from "../../models/driver.js";
import { Admin } from "../../models/admin.js";
import Token from "../../models/Token.js";
import sendEmail from "../../helpers/sendEmail.js";
import hashToken from "../../helpers/hashToken.js";

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

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

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, user_type, ...additionalInfo } = req.body;

  // Validation
  if (!name || !email || !password || !phone || !address || !user_type) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Check if user exists
  const userExists = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (userExists) {
    res.status(400);
    throw new Error("User with this email or phone already exists");
  }

  // Create user based on type
  let user;
  const userData = {
    name,
    email,
    password_hash: password,
    phone,
    address,
    user_type,
  };

  try {
    switch (user_type) {
      case "customer":
        user = await Customer.create({
          ...userData,
          loyalty_points: 0,
          wallet_balance: 0,
        });
        break;

      case "driver":
        if (!additionalInfo.license_number || !additionalInfo.vehicle_info) {
          res.status(400);
          throw new Error("License number and vehicle info are required for drivers");
        }
        user = await Driver.create({
          ...userData,
          ...additionalInfo,
          account_status: "inactive",
        });
        break;

      case "admin":
        if (!additionalInfo.admin_level) {
          res.status(400);
          throw new Error("Admin level is required");
        }
        user = await Admin.create({
          ...userData,
          ...additionalInfo,
        });
        break;

      default:
        res.status(400);
        throw new Error("Invalid user type");
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Login User
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

// Verify Email
export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("User already verified");
  }

  // Delete existing token if exists
  await Token.deleteOne({ userId: user._id });

  // Create verification token
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
  const hashedToken = hashToken(verificationToken);

  // Save token document
  await Token.create({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  // Create verification URL
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      template: "verifyEmail",
      data: {
        name: user.name,
        verificationUrl,
      },
    });
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide old and new password");
  }

  const user = await User.findById(req.user._id);

  const isPasswordValid = await user.comparePassword(oldPassword);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Old password is incorrect");
  }

  user.password_hash = newPassword;
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
});