import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

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

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    console.log("🔍 Razorpay Verify - sign:", sign);
    console.log("🔍 Razorpay Verify - expectedSign:", expectedSign);
    console.log("🔍 Razorpay Verify - actualSignature:", razorpay_signature);

    if (expectedSign === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("🔥 VERIFY PAYMENT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
