import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { User } from "../../models/user.js";
import { Customer } from "../../models/customer.js";
import { Driver } from "../../models/driver.js";
import { Admin } from "../../models/admin.js";
import Token from "../../models/Token.js";
import hashToken from "../../../helpers/hashToken.js";
import sendEmail from "../../../helpers/sendEmail.js";

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

// login status
export const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    // 401 Unauthorized
    res.status(401).json({ message: "Not authorized, please login!" });
  }
  // verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
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
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide old and new password");
  }

  const user = await User.findById(req.user._id);

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Old password is incorrect");
  }

  user.password_hash = newPassword;
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
});

// forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    // 404 Not Found
    return res.status(404).json({ message: "User not found" });
  }

  // see if reset token exists
  let token = await Token.findOne({ userId: user._id });

  // if token exists --> delete the token
  if (token) {
    await token.deleteOne();
  }

  // create a reset token using the user id ---> expires in 1 hour
  const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;

  // hash the reset token
  const hashedToken = hashToken(passwordResetToken);

  await new Token({
    userId: user._id,
    passwordResetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  }).save();

  // reset link
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

  // send email to user
  const subject = "Password Reset - Breezo";
  const send_to = user.email;
  const send_from = process.env.USER_EMAIL;
  const reply_to = "noreply@noreply.com";
  const template = "forgotPassword";
  const name = user.name;
  const url = resetLink;

  try {
    await sendEmail(subject, send_to, send_from, reply_to, template, name, url);
    res.json({ message: "Email sent" });
  } catch (error) {
    console.log("Error sending email: ", error);
    return res.status(500).json({ message: "Email could not be sent" });
  }
});

// reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  // hash the reset token
  const hashedToken = hashToken(resetPasswordToken);

  // check if token exists and has not expired
  const userToken = await Token.findOne({
    passwordResetToken: hashedToken,
    // check if the token has not expired
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  // find user with the user id in the token
  const user = await User.findById(userToken.userId);

  // update user password
  user.password = password;
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});

// Deactive Account
export const DeActiveAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.is_active = false;
  await user.save();

  res.status(200).json({ message: "Account deactivated successfully" });
});

// Active Account
export const ActiveAccount = asyncHandler(async (req, res) => {
  let user;

  // Find user in the appropriate model based on user type
  switch (req.user.user_type) {
    case "customer":
      user = await Customer.findById(req.user._id);
      break;
    case "driver":
      user = await Driver.findById(req.user._id);
      break;
    case "admin":
      user = await Admin.findById(req.user._id);
      break;
    default:
      res.status(400);
      throw new Error("Invalid user type");
  }

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.is_active = true;
  await user.save();

  res.status(200).json({ message: "Account activated successfully" });
});
