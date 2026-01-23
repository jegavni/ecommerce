import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  TextField,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Drawer,
  Divider,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { addToCart } from "../Redux/slices/cartSlice";
import { logout as logoutUser } from "../Redux/slices/userSlice";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [search, setSearch] = useState("");
  const [activeDeal, setActiveDeal] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
      setDeals(res.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- AUTO SLIDE DEALS ---------------- */
  useEffect(() => {
    if (deals.length <= 1) return;
    const timer = setInterval(
      () => setActiveDeal((prev) => (prev + 1) % deals.length),
      3000
    );
    return () => clearInterval(timer);
  }, [deals]);

  /* ---------------- ADD TO CART ---------------- */
  const handleAddToCart = (product) => {
    if (!user) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }
    dispatch(addToCart(product));
    toast.success(`${product.title} added to cart`);
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    dispatch(logoutUser());
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth={false} disableGutters>
      {/* ---------------- HEADER ---------------- */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          bgcolor: "white",
          boxShadow: 1,
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="warning.main">
          🛍️ Amazon Clone
        </Typography>

        {user ? (
          <IconButton onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Button variant="outlined" onClick={() => navigate("/login")}>
            Login
          </Button>
        )}
      </Box>

      {/* ---------------- SEARCH ---------------- */}
      <Box sx={{ px: 2, mt: 3 }}>
        <TextField
          fullWidth
          placeholder="🔍 Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* ---------------- DEALS CAROUSEL ---------------- */}
      {deals.length > 0 && (
        <Box sx={{ px: 2, mt: 4, position: "relative" }}>
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardMedia
              component="img"
              height="320"
              image={`http://localhost:5000/${deals[activeDeal].image}`}
              alt={deals[activeDeal].title}
            />

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                display: "flex",
                alignItems: "flex-end",
                p: 2,
                color: "white",
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {deals[activeDeal].title}
                </Typography>
                <Typography variant="h6">
                  ₹{deals[activeDeal].price}
                </Typography>
              </Box>
            </Box>
          </Card>

          <IconButton
            onClick={() =>
              setActiveDeal((prev) => (prev - 1 + deals.length) % deals.length)
            }
            sx={{
              position: "absolute",
              top: "50%",
              left: 10,
              bgcolor: "rgba(0,0,0,0.6)",
              color: "white",
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <IconButton
            onClick={() => setActiveDeal((prev) => (prev + 1) % deals.length)}
            sx={{
              position: "absolute",
              top: "50%",
              right: 10,
              bgcolor: "rgba(0,0,0,0.6)",
              color: "white",
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}

      {/* ---------------- PRODUCTS ---------------- */}
      <Grid container spacing={3} sx={{ px: 2, mt: 4 }}>
        {filteredProducts.length === 0 && (
          <Typography sx={{ mx: "auto", mt: 5 }}>
            😕 No products found
          </Typography>
        )}

        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product._id}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={`http://localhost:5000/${product.image}`}
                alt={product.title}
                sx={{ objectFit: "contain", p: 1, cursor: "pointer" }}
                onClick={() => navigate(`/product/${product._id}`)}
              />

              <CardContent>
                <Typography noWrap fontWeight="bold">
                  {product.title}
                </Typography>

                <Typography color="success.main" fontWeight="bold">
                  ₹{product.price}
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  startIcon={<ShoppingCartIcon />}
                  sx={{ mt: 1 }}
                  onClick={() => handleAddToCart(product)}
                >
                  {user ? "Add to Cart" : "Login to Add"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ---------------- DRAWER ---------------- */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260, p: 2 }}>
          <Typography variant="h6">Hello, {user?.name}</Typography>
          <Divider sx={{ my: 2 }} />

          <List>
            <ListItem button onClick={() => navigate("/dashboard")}>
              <ListItemText primary="📊 Dashboard" />
            </ListItem>
            <ListItem button onClick={() => navigate("/orders")}>
              <ListItemText primary="📦 Orders" />
            </ListItem>
            <ListItem button onClick={() => navigate("/cart")}>
              <ListItemText primary="🛒 Cart" />
            </ListItem>
            <ListItem button onClick={() => navigate("/profile")}>
              <ListItemText primary="👤 Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="🚪 Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Container>
  );
};

export default Home;
