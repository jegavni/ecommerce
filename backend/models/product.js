import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  category: String,
  stock: Number,
  image: String,
  rating: { type: Number, default: 0 }
});

export default mongoose.model("Product", productSchema);
