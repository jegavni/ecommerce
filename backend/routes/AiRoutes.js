import express from "express";
import { aiChat, comparePrice} from "../controllers/aiController.js";

const router = express.Router();

/* =============================================
   1. AI Chat Endpoint
   POST /api/ai/chat
============================================= */
router.post("/chat", aiChat);

/* =============================================
   2. AI Price Comparison Endpoint
   POST /api/ai/compare-price
============================================= */
router.post("/compare-price", comparePrice);

/* =============================================
   3. AI Dynamic Ad Banner Generator
   GET /api/ai/ad-banner
============================================= */
// router.get("/ad-banner", getAdBanner);

export default router;