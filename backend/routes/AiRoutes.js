import express from "express";
import { aiChat, comparePrice} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/chat", protect, aiChat);


router.post("/compare-price", protect , comparePrice);



export default router;