import mongoose from "mongoose";
import { User } from "./user.js";

const adminSchema = new mongoose.Schema(
  {
    profit_percentage: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v),
    },
    admin_level: {
      type: String,
      enum: ["super_admin", "manager", "support"],
      required: true,
    },
  },
  {
    toJSON: { virtuals: true, getters: true },
  }
);

adminSchema.virtual("admin_id").get(function () {
  return this._id;
});

export const Admin = User.discriminator("admin", adminSchema);
