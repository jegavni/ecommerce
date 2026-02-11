import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, (req, res) => {
    console.log("Me endpoint hit");
  res.json({ user: req.user });
});


export default router;
