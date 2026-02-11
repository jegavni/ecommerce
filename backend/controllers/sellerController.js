import User from "../models/user.js";

/**
 * POST /api/seller/become
 * Body: { storeName, gstNumber, phone }
 * Only for logged-in users
 */
export const becomeSeller = async (req, res) => {
  try {
    const { storeName, gstNumber, phone } = req.body;

    // ✅ Get user from middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "seller") {
      return res.status(400).json({ message: "You are already a seller" });
    }

    // ✅ Update role & seller profile
    user.role = "seller";
    user.sellerProfile = {
      storeName,
      gstNumber,
      phone,
      isVerified: false, // Admin can verify later
    };

    await user.save();

    res.status(200).json({
      message: "You are now a seller",
      user, // updated user info
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
