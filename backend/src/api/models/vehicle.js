import mongoose from "mongoose";
import { User } from "./user.js";

const vehicleSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be valid"],
    },
    license_plate: {
      type: String,
      required: [true, "License plate is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    vehicle_type: {
      type: String,
      enum: ["car", "tricycle", "bus", "motorcycle"],
      required: [true, "Vehicle type is required"],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
