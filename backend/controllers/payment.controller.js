import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.status(200).json({
      order: order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("🔥 FULL RAZORPAY ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
