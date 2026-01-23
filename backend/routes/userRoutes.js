import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

const router = express.Router();

/* =========================
   AUTH
========================= */

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   ADDRESSES
========================= */

// GET ALL ADDRESSES
router.get("/:userId/addresses", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("addresses");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD NEW ADDRESS
router.post("/:userId/addresses", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAddress = req.body;

    // 🔁 Duplicate address check
    const duplicate = user.addresses.some((addr) =>
      addr.name === newAddress.name &&
      addr.phone === newAddress.phone &&
      addr.addressLine === newAddress.addressLine &&
      addr.city === newAddress.city &&
      addr.state === newAddress.state &&
      addr.pincode === newAddress.pincode
    );

    if (duplicate) {
      return res.status(409).json({
        message: "This address already exists",
      });
    }

    // ⭐ Handle default address
    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // 🟢 First address → default
    if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE ADDRESS
router.put("/:userId/addresses/:addressId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    Object.assign(address, req.body);

    // ⭐ If set default → unset others
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = addr._id.equals(address._id);
      });
    }

    await user.save();

    res.json({
      message: "Address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SET DEFAULT ADDRESS
router.put("/:userId/addresses/:addressId/default", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === req.params.addressId;
    });

    await user.save();

    res.json({
      message: "Default address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
