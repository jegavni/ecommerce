import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );
        setProduct(data);
      } catch (err) {
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={product.images?.[0]?.url || "/placeholder.png"}
            alt={product.title}
            sx={{ height: 400, objectFit: "contain" }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" fontWeight="bold">
            {product.title}
          </Typography>

          <Typography variant="h5" color="success.main" sx={{ my: 2 }}>
            ₹{product.price}
          </Typography>

          <Typography sx={{ mb: 3 }}>
            {product.description || "No description available"}
          </Typography>

          <Button
            variant="contained"
            color="warning"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;
