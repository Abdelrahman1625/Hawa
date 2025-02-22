import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../models/user.js";
import { Customer } from "../../models/customer.js";
import { Driver } from "../../models/driver.js";
import { Admin } from "../../models/admin.js";
import { Vehicle } from "../../models/vehicle.js";

class UserController {
  async createUser(req, res, next) {
    try {
      const { user_type, ...userData } = req.body;

      let newUser;
      switch (user_type) {
        case "customer":
          newUser = new Customer({
            ...userData,

            wallet_balance: 0,
            loyalty_points: 0,
          });
          break;
        case "driver":
          newUser = new Driver({
            ...userData,
            account_status: "inactive",
            is_available: false,
          });
          break;
        case "admin":
          newUser = new Admin({
            ...userData,
            profit_percentage: userData.profit_percentage || 0,
          });
          break;
      }

      //check if user already exist
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      //save usr to database
      const savedUser = await newUser.save();

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: savedUser,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "User creation failed", error: error.message });
      next(error);
    }
  }

  async getProfile(req, res) {
    try {
      const user = req.user;
      //const user = await User.findById(req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ message: "User Not Found", error: error.message });
      }
      res.status(200).json(user);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Profile fetch failed", error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
      });
      res.json(user);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Profile update failed", error: error.message });
    }
  }
}

export default new UserController();
