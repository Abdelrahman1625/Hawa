import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../../models/user.js";
import { Customer } from "../../models/customer.js";
import { Driver } from "../../models/driver.js";
import { Admin } from "../../models/admin.js";
import { Vehicle } from "../../models/vehicle.js";

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
      license_number,
      license_image,
      vehicle,
      profit_percentage,
      admin_level,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email or phone already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    switch (user_type) {
      case "customer":
        user = new Customer({
          name,
          email,
          password_hash: hashedPassword,
          phone,
          address,
          user_type,
          loyalty_points: 0,
          wallet_balance: 0,
        });
        break;

      case "driver":
        if (!license_number || !vehicle) {
          return res.status(400).json({ error: "License number and vehicle information are required for drivers" });
        }

        // Check if vehicle license plate already exists
        const existingVehicle = await Vehicle.findOne({ license_plate: vehicle.license_plate });
        if (existingVehicle) {
          return res.status(400).json({ error: "Vehicle with this license plate already exists" });
        }

        const newVehicle = new Vehicle(vehicle);
        const savedVehicle = await newVehicle.save();

        user = new Driver({
          name,
          email,
          password_hash: hashedPassword,
          phone,
          address,
          user_type,
          license_number,
          license_image,
          account_status: "inactive",
          vehicle: savedVehicle._id,
        });
        break;

      case "admin":
        if (!profit_percentage || !admin_level) {
          return res.status(400).json({ error: "Profit percentage and admin level are required for admins" });
        }

        user = new Admin({
          name,
          email,
          password_hash: hashedPassword,
          phone,
          address,
          user_type,
          profit_percentage,
          admin_level,
        });
        break;

      default:
        return res.status(400).json({ error: "Invalid user type" });
    }

    await user.save();
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid login credentials" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid login credentials" });

    if (!user.is_active)
      return res.status(401).json({ error: "Account is deactivated" });

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
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: error?.message || "Something went wrong" });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
