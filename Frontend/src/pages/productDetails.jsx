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

  const { user } = useSelector((state) => state.user);

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
    { withCredentials: true } // 🔥 sends cookie token
  ).catch(() => {});
}, [product?._id]);


  /* ================= FETCH SIMILAR PRODUCTS ================= */
  useEffect(() => {
    if (!product?.category) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products?category=${product.category}`)
      .then((res) => {
        const list = res.data.products || [];
        setSimilarProducts(
          list
            .filter(
              (p) => p._id !== product._id && p.status === "approved"
            )
            .slice(0, 4)
        );
      })
      .catch(() => { });
  }, [product]);

  /* ================= RESET IMAGE WHEN PRODUCT CHANGES ================= */
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

  if (loading) return <p className="p-4">Loading...</p>;
  if (!product) return null;

  return (
    <Container sx={{ mt: 4, mb: 10 }}>
      <Grid container spacing={5}>
        {/* IMAGE GALLERY */}
        {/* IMAGE GALLERY */}
{/* IMAGE GALLERY */}
<Grid item xs={12} md={6}>
  <div className="bg-white rounded-2xl p-6 shadow-sm relative">
    <CardMedia
      component="img"
      image={product.images?.[selectedImage]?.url || "/placeholder.png"}
      alt={product.title}
      sx={{ height: 420, objectFit: "contain" }}
    />

    {/* WISHLIST & SHARE BUTTONS */}
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      {/* WISHLIST BUTTON */}
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

      {/* SHARE BUTTON */}
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => {
          const shareData = {
            title: product.title,
            text: `Check out this product: ${product.title}`,
            url: window.location.href,
          };

          if (navigator.share) {
            navigator.share(shareData).catch(() => {
              toast.error("Unable to share");
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info("Product link copied to clipboard");
          }
        }}
      >
        🔗
      </Button>
    </div>

    {/* IMAGE THUMBNAILS */}
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

          {/* PRICE */}
          <div className="flex items-center gap-3 mt-2">
            <Typography variant="h4" color="success.main" fontWeight="bold">
              ₹{product.price}
            </Typography>

            {product.mrp && (
              <Typography sx={{ textDecoration: "line-through", color: "gray" }}>
                ₹{product.mrp}
              </Typography>
            )}

            {product.mrp && product.mrp > product.price && (
              <span className="text-green-600 font-semibold text-sm">
                {Math.round(
                  ((product.mrp - product.price) / product.mrp) * 100
                )}% off
              </span>
            )}
          </div>

          {/* STOCK */}
          <Typography
            sx={{ mt: 1 }}
            color={product.stock ? "success.main" : "error.main"}
          >
            {product.stock ? `In Stock (${product.stock})` : "Out of Stock"}
          </Typography>

          {/* DESCRIPTION */}
          <Typography sx={{ mt: 3, lineHeight: 1.7 }}>
            {product.description}
          </Typography>

          {/* POLICIES */}
          <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600">
            <span className="bg-gray-100 px-3 py-1 rounded">
              🚚 COD {product.codAvailable ? "Available" : "Not Available"}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded">
              🔁 {product.returnPolicy} Return
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded">
              🛡 {product.warranty}
            </span>
          </div>

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
            {/* SHARE & LIKE BUTTONS */}
            <div className="flex gap-3 mt-4">
              {/* LIKE BUTTON */}
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setProduct((prev) => ({
                    ...prev,
                    likes: (prev.likes || 0) + 1,
                  }));
                  toast.success("You liked this product");
                }}
              >
                ❤️ Like {product.likes || 0}
              </Button>

              {/* SHARE BUTTON */}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  const shareData = {
                    title: product.title,
                    text: `Check out this product: ${product.title}`,
                    url: window.location.href,
                  };

                  if (navigator.share) {
                    navigator.share(shareData).catch(() => {
                      toast.error("Unable to share");
                    });
                  } else {
                    // fallback: copy link
                    navigator.clipboard.writeText(window.location.href);
                    toast.info("Product link copied to clipboard");
                  }
                }}
              >
                🔗 Share
              </Button>
            </div>

          </div>
        </Grid>
      </Grid>

      {/* SPECIFICATIONS */}
      {product.specifications && (
        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm">
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Specifications
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="text-gray-500">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIMILAR PRODUCTS */}
      {similarProducts.length > 0 && (
        <div className="mt-10">
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Similar Products
          </Typography>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
                className="bg-white rounded-xl p-3 cursor-pointer hover:shadow"
              >
                <img
                  src={item.images?.[0]?.url || "/placeholder.png"}
                  className="h-40 w-full object-contain"
                />
                <p className="text-sm font-medium truncate mt-2">
                  {item.title}
                </p>
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
