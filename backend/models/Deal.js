import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // optional, link to a product
  price: { type: Number, required: true },
  image: { type: String }, // can use product image
  startDate: { type: Date, default: Date.now }, // when the deal starts
  endDate: { type: Date, required: true } // when the deal ends
});

export default mongoose.model("Deal", dealSchema);
