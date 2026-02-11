import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /* ================= PRICING ================= */
    price: {
      type: Number,
      required: true,
    },

    mrp: {
      type: Number,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    sku: {
      type: String,
      unique: true,
      trim: true,
    },

    /* ================= CONTENT ================= */
    description: {
      type: String,
      required: true,
      trim: true,
    },

    specifications: {
      type: Map,
      of: String,
    },

    images: [
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
],


    /* ================= SHIPPING & POLICY ================= */
    codAvailable: {
      type: Boolean,
      default: true,
    },

    warranty: {
      type: String,
      default: "No Warranty",
    },

    returnPolicy: {
      type: String,
      default: "7 Days",
    },

    /* ================= SELLER ================= */
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ================= ADMIN FLOW ================= */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
