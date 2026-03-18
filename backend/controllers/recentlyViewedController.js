import RecentlyViewed from "../models/recentlyViewed.js";

const recentlyViewedController = async (req, res) => {
  try {
    // 🔒 Check if user exists (from auth middleware)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    const userId = req.user._id;

    const items = await RecentlyViewed.find({ user: userId })
      .populate("product")
      .sort({ viewedAt: -1 })
      .limit(8);

    // 🟡 Optional: handle empty list
    if (!items || items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No recently viewed items",
        data: [],
      });
    }

    // ✅ Success response
    res.status(200).json({
      success: true,
      data: items,
    });

  } catch (error) {
    console.error("Recently Viewed Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default recentlyViewedController;