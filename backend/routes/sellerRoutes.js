import express from "express";
import { becomeSeller } from "../controllers/sellerController.js";
import { protectSeller } from "../middleware/authMiddleware.js";
import { updateProduct } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
console.log("Seller routes loaded");

router.post("/becomeseller", protect, becomeSeller);
router.put("/product/:id", protectSeller, updateProduct);

export default router; // ✅ export default router
