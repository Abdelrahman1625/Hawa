import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password_hash: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    user_type: {
      type: String,
      enum: ["customer", "driver", "admin"],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "user_type",
    toJSON: {
      virtuals: true,
      getters: true,
    },
  }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password_hash")) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
  next();
});

// Compare Password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Abstract Model
export const User = mongoose.model("User", userSchema);
