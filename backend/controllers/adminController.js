import User from "../models/user.js";
import Product from "../models/product.js";

export const getDashboardStats = async (req, res) => {
  const pendingProducts = await Product.countDocuments({ status: "pending" });
  const approvedProducts = await Product.countDocuments({ status: "approved" });
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();

  res.json({
    pendingProducts,
    approvedProducts,
    totalProducts,
    totalUsers,
  });
};
