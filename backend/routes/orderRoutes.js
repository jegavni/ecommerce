import express from "express";
import User from "../models/user.js";
import Order from "../models/order.js";
import Product from "../models/product.js";

const router = express.Router();

/* CREATE ORDER */
router.post("/", async (req, res) => {
  try {
    const { userId, items, totalAmount, paymentMethod, paymentStatus, razorpayPaymentId, address: frontendAddress } = req.body;

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    let address = frontendAddress;
    if (!address) {
      address = userDoc.addresses?.find(a => a.isDefault) || userDoc.addresses?.[0];
    }

    if (!address) {
      return res.status(400).json({ message: "No address found" });
    }

    const deliveryAddress = {
      name: address.name,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    };

    // 🔥 CHECK PRODUCT STOCK FIRST
    const updatedProducts = [];
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const productStock = Number(product.stock) || 0;
      const orderQuantity = Number(item.qty) || 0;

      if (productStock < orderQuantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title}`,
        });
      }

      product.stock = productStock - orderQuantity;
      updatedProducts.push(product);
    }

    // 🔥 CREATE ORDER
    const order = new Order({
      user: userDoc._id,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentStatus || "PENDING",
      razorpayPaymentId: razorpayPaymentId || undefined,
    });

    await order.save();

    // 🔥 UPDATE PRODUCT STOCK
    for (let product of updatedProducts) {
      await product.save();
    }

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












export default router;
