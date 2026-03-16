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

  const role = user?.role;

  // Role based menu configuration
  const roleMenus = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Manage Products", path: "/adminproduct" },
      { label: "Manage Orders", path: "/admin/orders" }
    ],
    seller: [
      { label: "Add Product", path: "/addproduct" },
      { label: "Orders", path: "/seller/orders" }
    ],
    customer: [
      { label: "My Orders", path: "/orders" },
      { label: "My Addresses", path: "/addresses" }
    ]
  };

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
          py: 1
        }}
      >
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{ color: "white" }}
        >
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

        {/* Address */}
        {defaultAddress && (
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => navigate("/addresses")}
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
          🛒 Cart ({cartItems?.length || 0})
        </Box>
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300 }}>

          {/* Drawer Header */}
          <Box sx={{ background: "#232F3E", color: "white", p: 2 }}>
            <Typography variant="h6">
              {user ? `Hello, ${user.name}` : "Hello, Sign in"}
            </Typography>
          </Box>

          {/* Role Based Menu */}
          {user && roleMenus[role]?.length > 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {role === "admin"
                  ? "Admin Panel"
                  : role === "seller"
                  ? "Seller Center"
                  : "My Account"}
              </Typography>

              {roleMenus[role].map((item) => (
                <Typography
                  key={item.label}
                  sx={{ cursor: "pointer", mt: 1 }}
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          )}

          {/* Help & Settings */}
          <Box sx={{ p: 2, borderTop: "1px solid #ddd" }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Help & Settings
            </Typography>

            <Typography sx={{ mt: 1, cursor: "pointer" }}>
              Customer Service
            </Typography>

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