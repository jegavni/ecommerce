import mongoose from "mongoose";
import addressSchema from "./addressSchema.js";

const sellerProfileSchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true },
    gstNumber: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
);

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
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    sellerProfile: sellerProfileSchema,

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/**
 * ✅ IMPORTANT
 * Model name MUST be capitalized & consistent
 */
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
