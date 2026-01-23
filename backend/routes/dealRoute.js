import express from "express";
import Deal from "../models/Deal.js";

const router = express.Router();

// GET all active deals
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const deals = await Deal.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ startDate: 1 });

    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optional: Seed some deals
router.post("/seed", async (req, res) => {
  await Deal.deleteMany(); // clear old deals

  const deals = [
    {
      title: "iPhone 15 Flash Sale",
      price: 109999,
      image: "uploads/iphone15.png",
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    },
    {
      title: "Samsung TV Deal",
      price: 69999,
      image: "uploads/sonyTV.png",
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    }
  ];

  await Deal.insertMany(deals);
  res.json({ message: "Deals seeded successfully" });
});

export default router;
