import Product from "../models/product.js";

export const getPendingProducts = async (req, res) => {
  const products = await Product.find({ status: "pending" });
  res.json(products);
};

export const approveProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.status = "approved";
  await product.save();

  res.json({ message: "Product approved" });
};

export const rejectProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.status = "rejected";
  await product.save();

  res.json({ message: "Product rejected" });
};
