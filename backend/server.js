import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import dealRoute from "./routes/dealRoute.js";
import orderRoutes from "./routes/orderRoutes.js";
import forgetRoutes from "./routes/forgetRoutes.js"; 
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js"
import addressRoutes from "./routes/address.routes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import recentlyViewedRoutes from "./routes/recentlyViewedRoutes.js";




const app = express();
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(cors(
  { 
    origin:[
      "http://localhost:5173",
      "https://ecommerce-t7cc.onrender.com"
    ],
    
    credentials:true,
    methods : ["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
  }
));
app.use(express.json());
app.use(cookieParser()); // 👈 BEFORE ROUTES
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/forget", forgetRoutes);
app.use("/api/products", productRoutes);
app.use("/api/deals", dealRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users",addressRoutes);
app.use("/api/seller",sellerRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/recentlyViewed", recentlyViewedRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/cookie-test", (req, res) => {
  res.json({
    cookies: req.cookies,
    raw: req.headers.cookie,
  });
});



const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI_DEV;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// const hashed = await bcrypt.hash("jeg@1995", 10);
// await User.updateOne(
//   { email: "jegatheesh.stackup@gmail.com" },
//   { $set: { password: hashed } }
// );

// console.log("Admin password fixed");
// process.exit();
// console.log(hashed);

