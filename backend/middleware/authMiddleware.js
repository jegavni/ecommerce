import jwt from "jsonwebtoken";
import User from "../models/user.js";

/* =========================
   PROTECT (Any Logged-in User)
========================= */


export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Check Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ Check cookie (THIS FIXES REFRESH LOGIN)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log("Authenticated user:", user.email);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


/* =========================
   PROTECT SELLER (Seller Only)
========================= */

export const protectSellerOrAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Allow both seller & admin
    if (user.role !== "seller" && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied (Seller/Admin only)" });
    }

    req.user = user;
    next();
  } catch (error) {
    
    console.error(error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
