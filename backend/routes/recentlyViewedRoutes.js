// routes/recentlyViewed.js
import express from "express";
import RecentlyViewed from "../models/recentlyViewed.js";
import { protect } from "../middleware/authMiddleware.js";
import recentlyViewedController  from "../controllers/recentlyViewedController.js";
const router = express.Router();

/**
 * GET recently viewed
 */
router.get("/", protect,recentlyViewedController); 

/**
 * POST add viewed product
 */
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const existing = await RecentlyViewed.findOne({
      user: userId,
      product: productId,
    });

    if (existing) {
      existing.viewedAt = new Date();
      await existing.save();
      return res.json(existing);
    }

    const item = await RecentlyViewed.create({
      user: userId,
      product: productId,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;