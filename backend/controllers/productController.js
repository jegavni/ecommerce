import Product from "../models/product.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

export const uploadImagesToCloudinary = async (files, options = {}) => {
  const uploadedImages = [];

  for (const file of files) {
    const result = await cloudinary.uploader.upload(file.tempFilePath || file.path, {
      folder: options.folder || "products",
      public_id: options.publicId
        ? `${options.publicId}-${Date.now()}`
        : `product-${Date.now()}`,
      overwrite: false,
    });

    uploadedImages.push({
      url: result.secure_url,
      publicId: result.public_id,
    });
  }

  return uploadedImages;
};




export const createProduct = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    /* ================= IMAGE HANDLING ================= */
    const files = req.files?.images
      ? Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images]
      : [];

    if (files.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    // returns ARRAY OF STRINGS (urls)
    const imageUrls = await uploadImagesToCloudinary(files, {
      folder: "products",
      publicId: "product",
    });

    /* ================= SPECIFICATIONS ================= */
    let specs = {};
    if (req.body.specifications) {
      req.body.specifications.split(",").forEach((item) => {
        const [key, value] = item.split(":");
        if (key && value) specs[key.trim()] = value.trim();
      });
    }

    /* ================= CREATE PRODUCT ================= */
    const product = await Product.create({
      title: req.body.title,
      brand: req.body.brand,
      category: req.body.category,
      description: req.body.description,
      price: Number(req.body.price),
      mrp: Number(req.body.mrp),
      stock: Number(req.body.stock),
      sku: req.body.sku,
      specifications: specs,
      codAvailable: req.body.codAvailable === "true",
      warranty: req.body.warranty,
      returnPolicy: req.body.returnPolicy,
      images: imageUrls, // ✅ matches schema
      seller: req.user._id,
      status: "pending",
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
};








/* =====================
   SELLER: MY PRODUCTS
===================== */
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    console.log("GET PRODUCT BY ID 👉", req.params.id);
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findOne({
      _id: id,
      status: "approved", // only approved products visible to users
    }).populate("seller", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================
   PUBLIC: APPROVED PRODUCTS
===================== */
export const getApprovedProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Search
    const keyword = req.query.keyword
      ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: "i" } },
          { description: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
      : {};

    // Price filter
    const priceFilter = {};
    if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);

    const filter = {
      status: "approved",
      ...keyword,
      ...(Object.keys(priceFilter).length && { price: priceFilter }),
    };

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    /* ================= IMAGE HANDLING ================= */
    const files = req.files?.images
      ? Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images]
      : [];

    if (files.length > 0) {
      // upload new images → get URLs only
      const imageUrls = await uploadImagesToCloudinary(files, {
        folder: "products",
        publicId: "updated",
      });

      // replace existing images
      product.images = imageUrls;
    }

    /* ================= UPDATE FIELDS ================= */
    product.title = req.body.title ?? product.title;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price ?? product.price;
    product.mrp = req.body.mrp ?? product.mrp;
    product.stock = req.body.stock ?? product.stock;
    product.category = req.body.category ?? product.category;

    product.status = "pending";
    product.rejectionReason = "";

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
};




export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
