import express from "express";
const router = express.Router();
import {
  forgotPassword,
  resetPassword,
} from "../controllers/forgetController.js";
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;
