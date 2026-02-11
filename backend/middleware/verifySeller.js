import User from "../models/user.js";

export const verifySeller = async (req, res, next) => {
  try {
    const userId = req.user.id; // set by verifyToken



    
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isSeller || !user.verifiedSeller) {
      return res.status(403).json({ message: "Only verified sellers can add products" });
    }

    next(); // user is verified seller
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
