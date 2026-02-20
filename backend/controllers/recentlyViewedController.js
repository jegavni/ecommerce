import RecentlyViewed from "../models/recentlyViewed.js";
const recentlyViewedController = async (req, res) => {
  
    const userId = req.user._id;

  const items = await RecentlyViewed.find({ user: userId })
    .populate("product")          // ← THIS is the missing piece
    .sort({ viewedAt: -1 })
    .limit(8);

  res.json(items);
};
export default recentlyViewedController;
