import express from "express";
import User from "../models/user.js";
import Order from "../models/order.js";

const router = express.Router();

/* CREATE ORDER */
router.post("/", async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const address =
      userDoc.addresses?.find(a => a.isDefault) ||
      userDoc.addresses?.[0];

    if (!address) {
      return res.status(400).json({ message: "No address found" });
    }

    // 🔥 EXPLICIT ADDRESS SNAPSHOT
    const deliveryAddress = {
      name: address.name,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    };

    const order = new Order({
      user: userDoc._id,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


/* ✅ GET ORDERS BY USER */
router.get("/users/:userId", async (req, res) => {
  console.log("Fetching orders for user:", req.params.userId);
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET ALL ORDERS (ADMIN) */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE ORDER STATUS */
router.put("/users/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;

    const userDoc = await User.findById(userId);
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    const address =
      userDoc.addresses?.find(a => a.isDefault) ||
      userDoc.addresses?.[0];

    if (!address)
      return res.status(400).json({ message: "No address found" });

    const order = new Order({
      user: userDoc._id,   // ✅ CRITICAL FIX
      items,
      totalAmount,
      deliveryAddress: address.toObject ? address.toObject() : address,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});









export default router;
