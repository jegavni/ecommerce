import { useState, useEffect, memo } from "react";
import { Box, Typography, IconButton, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../Redux/slices/userSlice";
import axios from "axios";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);

  // Fetch default address
  useEffect(() => {
    if (!user?._id) return;

    const fetchDefaultAddress = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${user._id}/addresses`
        );

        const addresses = res.data.addresses || res.data || [];
        const defaultAddr =
          addresses.find((a) => a.isDefault) || addresses[0] || null;

        setDefaultAddress(defaultAddr);
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    };

    fetchDefaultAddress();
  }, [user?._id]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#131921",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1,
        }}
      >
        {/* Menu Icon */}
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Typography
          variant="h6"
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/")}
        >
          EasyShop
        </Typography>

        {/* Delivery Address */}
        {defaultAddress && (
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => navigate("/cart")}
          >
            <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />

            <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <Typography variant="caption">Deliver to</Typography>

              <Typography variant="body2" fontWeight="bold">
                {defaultAddress.name} - {defaultAddress.city}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        {/* User */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <Typography variant="body2">
            {user ? `Hello, ${user.name}` : "Hello, Sign in"}
          </Typography>

          {user ? (
            <Typography
              variant="body2"
              sx={{ cursor: "pointer" }}
              onClick={handleLogout}
            >
              Logout
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Login / Register
            </Typography>
          )}
        </Box>

        {/* Cart */}
        <Box
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/cart")}
        >
          🛒 Cart ({cartItems.length})
        </Box>
      </Box>

      {/* Drawer */}
      <Drawer
  anchor="left"
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
>
  <Box sx={{ width: 300 }}>

    {/* Header */}
    <Box sx={{ background: "#232F3E", color: "white", p: 2 }}>
      <Typography variant="h6">
        {user ? `Hello, ${user.name}` : "Hello, Sign in"}
      </Typography>
    </Box>

    {/* Trending */}
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Trending
      </Typography>

      <Typography sx={{ cursor: "pointer", mt: 1 }}>Bestsellers</Typography>
      <Typography sx={{ cursor: "pointer" }}>New Releases</Typography>
      <Typography sx={{ cursor: "pointer" }}>Movers and Shakers</Typography>
    </Box>

    {/* Digital Content */}
    <Box sx={{ p: 2, borderTop: "1px solid #ddd" }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Digital Content and Devices
      </Typography>

      <Typography sx={{ mt: 1 }}>Echo & Alexa</Typography>
      <Typography>Fire TV</Typography>
      <Typography>Kindle E-Readers & eBooks</Typography>
      <Typography>Audible Audiobooks</Typography>
      <Typography>Prime Video</Typography>
      <Typography>Prime Music</Typography>
    </Box>

    {/* Shop by Category */}
    <Box sx={{ p: 2, borderTop: "1px solid #ddd" }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Shop by Category
      </Typography>

      <Typography sx={{ mt: 1 }}>Mobiles, Computers</Typography>
      <Typography>TV, Appliances, Electronics</Typography>
      <Typography>Men's Fashion</Typography>
      <Typography>Women's Fashion</Typography>
      <Typography sx={{ color: "#007185" }}>See all</Typography>
    </Box>

    {/* Programs */}
    <Box sx={{ p: 2, borderTop: "1px solid #ddd" }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Programs & Features
      </Typography>

      <Typography sx={{ mt: 1 }}>Gift Cards & Mobile Recharges</Typography>
      <Typography>Amazon Launchpad</Typography>
      <Typography>Amazon Business</Typography>
      <Typography>Handloom and Handicrafts</Typography>
      <Typography sx={{ color: "#007185" }}>See all</Typography>
    </Box>

    {/* Help */}
    <Box sx={{ p: 2, borderTop: "1px solid #ddd" }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Help & Settings
      </Typography>

      <Typography sx={{ mt: 1 }}>Your Account</Typography>
      <Typography>Customer Service</Typography>

      {user && (
        <Typography
          sx={{ cursor: "pointer", color: "red" }}
          onClick={handleLogout}
        >
          Sign Out
        </Typography>
      )}
    </Box>

  </Box>
</Drawer>
    </>
  );
};

export default memo(Header);