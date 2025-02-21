import mongoose from "mongoose";

const cashPaymentSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // rather than "Driver"
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // rather than "Customer"
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v),
    },
    payment_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
  },
  {
    toJSON: { getters: true },
  }
);

export const CashPayment = mongoose.model("CashPayment", cashPaymentSchema);
