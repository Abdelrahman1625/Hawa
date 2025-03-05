import express from "express";
import { User } from "../models/user.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user._id; // Using _id from MongoDB
    const user = await User.findById(userId)
      .select("-password_hash -_id -__v -customer_id -id"); // Exclude password and all IDs

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
