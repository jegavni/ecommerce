import mongoose from "mongoose";
import addressSchema from "./addressSchema.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
        qty: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    // ✅ STORE ADDRESS SNAPSHOT
    deliveryAddress: {
      type: addressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD"],
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING"],
    },

    razorpayPaymentId: {
      type: String,
    }

  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
