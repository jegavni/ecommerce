import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Slider from "react-slick";

const AddProduct = () => {
  const { id } = useParams();               // product id
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);

  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: "",
    price: "",
    mrp: "",
    stock: "",
    sku: "",
    description: "",
    specifications: "",
    warranty: "No Warranty",
    returnPolicy: "7 Days",
    codAvailable: true,
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const categories = ["Mobile", "Laptop", "Accessories", "Clothing", "Other"];

  /* ------------------ HANDLERS ------------------ */

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  setImages((prev) => [...prev, ...files]); // add new files
  setPreviews((prev) => [
    ...prev,
    ...files.map((f) => URL.createObjectURL(f)),
  ]);
};

// Remove newly selected image
const removePreview = (index) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
  setPreviews((prev) => prev.filter((_, i) => i !== index));
};

// Remove existing image in edit mode
const removeExistingImage = (index) => {
  setExistingImages((prev) => prev.filter((_, i) => i !== index));
};


  /* ------------------ SUBMIT ------------------ */

  const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => formData.append(key, value));

  // append new images
  images.forEach((img) => formData.append("images", img));

  // append existing images to keep them
  existingImages.forEach((url) => formData.append("existingImages", url));

  try {
    if (isEditMode) {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/seller/product/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Product updated successfully ");
    } else {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/products/createProduct`,
        formData,
        { withCredentials: true }
      );
      toast.success("Product added successfully ");
    }
    navigate("/");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed ");
  }
};


  /* ------------------ FETCH PRODUCT (EDIT) ------------------ */

  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`
        );
        console.log("Fetched product for edit ", res.data);
        const p = res.data?.product || res.data || {};

        console.log("Fetched product for edit ", p);

        setForm({
          title: p.title || "",
          brand: p.brand || "",
          price: p.price || "",
          category: p.category
            ? categories.find(c => c.toLowerCase() === p.category.toLowerCase())
            : "",
          mrp: p.mrp || "",
          stock: p.stock || "",
          sku: p.sku || "",
          description: p.description || "",
          specifications: p.specifications
            ? Object.entries(p.specifications)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
            : "",
          warranty: p.warranty || "No Warranty",
          returnPolicy: p.returnPolicy || "7 Days",
          codAvailable: p.codAvailable ?? true,
        });

        setExistingImages(p.images || []);
      } catch {
        toast.error("Failed to load product");
      }
    };

    fetchProduct();
  }, [id, isEditMode]);

  const sliderSettings = {
    dots: true,
    arrows: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
  };

  /* ------------------ UI ------------------ */

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 650,
        mx: "auto",
        p: 3,
        mt: 3,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: "#fff",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2}>
        {isEditMode ? "Edit Product" : "Add Product"}
      </Typography>

      <TextField fullWidth label="Product Title" name="title" value={form.title} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth label="Brand" name="brand" value={form.brand} onChange={handleChange} sx={{ mb: 2 }} />

      <TextField select fullWidth label="Category" name="category" value={form.category} onChange={handleChange} sx={{ mb: 2 }}>
        {categories.map((c) => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </TextField>

      <TextField fullWidth type="number" label="Selling Price" name="price" value={form.price} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth type="number" label="MRP" name="mrp" value={form.mrp} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth type="number" label="Stock Quantity" name="stock" value={form.stock} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth label="SKU" name="sku" value={form.sku} onChange={handleChange} sx={{ mb: 2 }} />

      <TextField fullWidth multiline rows={3} label="Description" name="description" value={form.description} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth multiline rows={3} label="Specifications" name="specifications" value={form.specifications} onChange={handleChange} sx={{ mb: 2 }} />

      <FormControlLabel
        control={
          <Switch
            checked={form.codAvailable}
            onChange={(e) =>
              setForm({ ...form, codAvailable: e.target.checked })
            }
          />
        }
        label="Cash on Delivery Available"
      />

      {/* EXISTING IMAGES (EDIT MODE) */}
{(previews.length > 0 || existingImages.length > 0) && (
  <Slider {...sliderSettings}>
    {existingImages.map((src, i) => (
      <div key={i} style={{ position: "relative" }}>
        <img
          src={src}
          alt=""
          style={{ height: 250, objectFit: "cover", borderRadius: 8 }}
        />
        <Button
          onClick={() => removeExistingImage(i)}
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            minWidth: 0,
            padding: "4px 8px",
          }}
          variant="contained"
          color="error"
        >
          X
        </Button>
      </div>
    ))}
    {previews.map((src, i) => (
      <div key={i} style={{ position: "relative" }}>
        <img
          src={src}
          alt=""
          style={{ height: 250, objectFit: "cover", borderRadius: 8 }}
        />
        <Button
          onClick={() => removePreview(i)}
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            minWidth: 0,
            padding: "4px 8px",
          }}
          variant="contained"
          color="error"
        >
          X
        </Button>
      </div>
    ))}
  </Slider>
)}


      <Button variant="outlined" component="label" fullWidth sx={{ my: 2 }}>
        Upload Images
        <input hidden type="file" multiple accept="image/*" onChange={handleImageChange} />
      </Button>

      <Button type="submit" variant="contained" fullWidth>
        {isEditMode ? "Update Product" : "Add Product"}
      </Button>
    </Box>
  );
};

export default AddProduct;
