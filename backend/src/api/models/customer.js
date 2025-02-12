import mongoose from "mongoose";
import { User } from "./user.js";

const customerSchema = new mongoose.Schema(
  {
    loyalty_points: { type: Number, default: 0 },
    favorite_drivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
      },
    ],
    wallet_balance: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0.0,
      get: (v) => parseFloat(v),
    },
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
  }
);

customerSchema.virtual("customer_id").get(function () {
  return this._id;
});

export const Customer = User.discriminator("customer", customerSchema);
