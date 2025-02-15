import mongoose from "mongoose";
import { User } from "./user.js";

const vehicleSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    license_plate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    color: { type: String, required: true },
    vehicle_type: {
      type: String,
      enum: ["car", "tricycle", "bus", "motorcycle"],
      required: true,
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = User.discriminator("driver", vehicleSchema);
