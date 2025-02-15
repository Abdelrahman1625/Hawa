import mongoose from "mongoose";
import { User } from "./user.js";

const driverSchema = new mongoose.Schema(
  {
    account_status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
    },
    last_payment_date: { type: Date },

    license_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // 🖼️ Optional license image (for verification purposes)
    license_image: {
      type: String,
      required: false,
    },

    current_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    is_available: { type: Boolean, default: false },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      unique: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
  }
);

driverSchema.index({ current_location: "2dsphere" });

export const Driver = User.discriminator("driver", driverSchema);
