import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Customer } from "../models/customer.js";
import { Driver } from "../models/driver.js";
import { Admin } from "../models/admin.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
};

export const register = async (req, res) => {
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    const token = generateToken(user._id);

    res.json({
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

export const logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
