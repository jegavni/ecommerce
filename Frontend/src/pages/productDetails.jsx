import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../Redux/slices/cartSlice";

import {
  Container,
  Grid,
  Typography,
  Button,
  CardMedia,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`
        );
        setProduct(data);
      } catch {
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ================= SAVE RECENTLY VIEWED ================= */
  useEffect(() => {
    if (!product?._id) return;

    axios.post(
      `${import.meta.env.VITE_API_URL}/api/recentlyViewed`,
      { productId: product._id },
      { withCredentials: true }
    ).catch(() => {});
  }, [product?._id]);

  /* ================= FETCH SIMILAR PRODUCTS ================= */
  useEffect(() => {
    if (!product?.category) return;

    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/products?category=${product.category}`
      )
      .then((res) => {
        const list = res.data.products || [];
        setSimilarProducts(
          list
            .filter((p) => p._id !== product._id && p.status === "approved")
            .slice(0, 4)
        );
      })
      .catch(() => {});
  }, [product]);

  /* ================= RESET IMAGE ================= */
  useEffect(() => {
    setSelectedImage(0);
  }, [product?._id]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!user) {
      toast.info("Please login to add items");
      return;
    }
    dispatch(addToCart(product));
    toast.success("Added to cart");
  };

  /* ================= DELETE PRODUCT ================= */
  const handleDelete = (id) => {
  toast(
    ({ closeToast }) => (
      <div>
        <p className="font-medium">Delete this product?</p>

        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-600 text-white px-3 py-1 rounded"
            onClick={async () => {
              try {
                await axios.delete(
                  `${import.meta.env.VITE_API_URL}/api/products/${id}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                toast.success("Product deleted");
                closeToast();

                navigate(
                  user?.role === "admin"
                    ? "/admin/products"
                    : "/seller/products"
                );
              } catch (err) {
                console.error(err);
                toast.error("Delete failed");
              }
            }}
          >
            Yes
          </button>

          <button
            className="bg-gray-300 px-3 py-1 rounded"
            onClick={closeToast}
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      autoClose: false, // 👈 important
      closeOnClick: false,
    }
  );
};

  if (loading) return <p className="p-4">Loading...</p>;
  if (!product) return null;

  return (
    <Container sx={{ mt: 4, mb: 10 }}>
      <Grid container spacing={5}>
        {/* IMAGE SECTION */}
        <Grid item xs={12} md={6}>
          <div className="bg-white rounded-2xl p-6 shadow-sm relative">
            <CardMedia
              component="img"
              image={product.images?.[selectedImage]?.url || "/placeholder.png"}
              alt={product.title}
              sx={{ height: 420, objectFit: "contain" }}
            />

            {/* WISHLIST & SHARE */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                variant="contained"
                color={product.inWishlist ? "error" : "default"}
                size="small"
                onClick={() => {
                  setProduct((prev) => ({
                    ...prev,
                    inWishlist: !prev.inWishlist,
                  }));
                  toast.success(
                    product.inWishlist
                      ? "Removed from wishlist"
                      : "Added to wishlist"
                  );
                }}
              >
                {product.inWishlist ? "❤️" : "🤍"}
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.title,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.info("Link copied");
                  }
                }}
              >
                🔗
              </Button>
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {product.images?.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 object-contain border rounded cursor-pointer p-1 ${
                    selectedImage === i ? "border-orange-500" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </Grid>

        {/* DETAILS */}
        <Grid item xs={12} md={6}>
          {product.brand && (
            <Typography variant="subtitle2" color="text.secondary">
              {product.brand.toUpperCase()}
            </Typography>
          )}

          <Typography variant="h4" fontWeight="bold">
            {product.title}
          </Typography>

          {/* ADMIN / SELLER ACTIONS */}
          {(user?.role === "admin" || user?.role === "seller") && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="contained"
                onClick={() =>
                  navigate(
                    user.role === "admin"
                      ? `/admin/product/edit/${product._id}`
                      : `/seller/product/edit/${product._id}`
                  )
                }
              >
                Edit
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => handleDelete(product._id)}
              >
                Delete
              </Button>
            </div>
          )}

          {/* PRICE */}
          <div className="flex items-center gap-3 mt-2">
            <Typography variant="h4" color="success.main">
              ₹{product.price}
            </Typography>

            {product.mrp && (
              <Typography sx={{ textDecoration: "line-through" }}>
                ₹{product.mrp}
              </Typography>
            )}
          </div>

          {/* STOCK */}
          <Typography sx={{ mt: 1 }}>
            {product.stock ? "In Stock" : "Out of Stock"}
          </Typography>

          {/* DESCRIPTION */}
          <Typography sx={{ mt: 3 }}>{product.description}</Typography>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mt-5">
            <Button
              variant="contained"
              color="warning"
              fullWidth
              disabled={!product.stock}
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>

            <Button
              variant="contained"
              color="success"
              fullWidth
              disabled={!product.stock}
              onClick={() => {
                handleAddToCart();
                navigate("/checkout");
              }}
            >
              Buy Now
            </Button>
          </div>
        </Grid>
      </Grid>

      {/* SIMILAR PRODUCTS */}
      {similarProducts.length > 0 && (
        <div className="mt-10">
          <Typography variant="h6">Similar Products</Typography>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
                className="bg-white rounded-xl p-3 cursor-pointer"
              >
                <img
                  src={item.images?.[0]?.url || "/placeholder.png"}
                  className="h-40 w-full object-contain"
                />
                <p className="text-sm mt-2">{item.title}</p>
                <p className="text-green-600 font-bold">₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default ProductDetails;