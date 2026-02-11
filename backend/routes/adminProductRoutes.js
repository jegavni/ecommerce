import express from "express";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from "../controllers/adminProductController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { getDashboardStats 
} from "../controllers/adminController.js";

const router = express.Router();
console.log("Admin Product Routes Loaded");

router.get("/pending", protect, isAdmin, getPendingProducts);
router.put("/:id/approve", protect, isAdmin, approveProduct);
router.put("/:id/reject", protect, isAdmin, rejectProduct);

// routes/adminRoutes.js
router.get("/dashboard", protect, isAdmin, getDashboardStats);
router.get("/pending-sellers", protect, isAdmin, getPendingProducts);
router.get("/pending-products", protect, isAdmin, getPendingProducts);

export default router;
