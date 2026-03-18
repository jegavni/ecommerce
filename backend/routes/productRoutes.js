import express from "express";
import {
  createProduct,
  getMyProducts,
  getApprovedProducts,
  deleteProduct,
  getProductById,
} from "../controllers/productController.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { protect, protectSellerOrAdmin } from "../middleware/authMiddleware.js";
import { isSeller } from "../middleware/roleMiddleware.js";
import { uploadProductImages } from "../middleware/uploadMiddleware.js";
import { updateProduct } from "../controllers/productController.js";
import { get } from "mongoose";

const router = express.Router();
console.log("Product routes loaded");

router.get("/", getApprovedProducts);
router.get("/:id", getProductById);
router.post("/createProduct", protect, isSeller, createProduct);
router.get("/my", protectSellerOrAdmin, isSeller, getMyProducts);
router.put(
  "/:id",
  protectSellerOrAdmin,
  isSeller,
  uploadProductImages,
  updateProduct
);
router.delete(
  "/:id",
  protectSellerOrAdmin,       // ✅ user must be logged in
  isAdmin,     // ✅ user must be admin
  deleteProduct
);
export default router;
