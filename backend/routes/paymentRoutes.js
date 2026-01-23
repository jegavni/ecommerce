import express from "express";
// import razorpay from "../config/razorpay.js";

const router = express.Router();

router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // INR → paise
    currency: "INR",
    receipt: `order_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

export default router;
