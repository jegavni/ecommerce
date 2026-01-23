import express from "express";
import Product from "../models/product.js"; 

const router = express.Router();

/**
 * GET ALL PRODUCTS
 * GET /api/products
 * GET /api/products?category=Mobiles
 */
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const products =
      category && category !== "Top Deals"
        ? await Product.find({ category })
        : await Product.find();

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
