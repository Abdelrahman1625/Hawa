import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickup_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    dropoff_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    fare_amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v),
    },
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    ride_status: {
      type: String,
      enum: ["requested", "accepted", "in_progress", "completed", "cancelled"],
      default: "requested",
    },
    ride_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { getters: true },
  }
);

// Add 2D index for geospatial queries (e.g., finding nearby rides)
rideSchema.index({ pickup_location: "2dsphere", dropoff_location: "2dsphere" });

export const Ride = mongoose.model("Ride", rideSchema);
