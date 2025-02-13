import mongoose from "mongoose";

const profitPaymentSchema = new mongoose.Schema(
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
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // rather than "Admin"
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
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    toJSON: { getters: true },
  }
);

export const ProfitPayment = mongoose.model(
  "ProfitPayment",
  profitPaymentSchema
);
