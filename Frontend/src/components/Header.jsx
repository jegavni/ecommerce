import { useState, useEffect, memo } from "react";
import { Box, Typography, IconButton, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../Redux/slices/userSlice";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);

  const role = user?.role;

  /* 🔍 SEARCH */
  const handleSearch = () => {
    const trimmed = searchTerm.trim();

    if (!trimmed && category === "all") return; //  avoid empty search

    const query = new URLSearchParams();

    if (trimmed) query.append("keyword", trimmed);
    if (category !== "all") query.append("category", category);

    navigate(`/search?${query.toString()}`);
  };

  /* FETCH DEFAULT ADDRESS */
  useEffect(() => {
    if (!user?._id) return;

    const fetchDefaultAddress = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${user._id}/addresses`,
          { withCredentials: true }
        );

        const addresses = res.data.addresses || [];
        const defaultAddr =
          addresses.find((a) => a.isDefault) || addresses[0] || null;

        setDefaultAddress(defaultAddr);
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    };

    fetchDefaultAddress();
  }, [user?._id]);

  /* LOGOUT */
  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  /*  ROLE MENUS */
  const roleMenus = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Add Product", path: "/addproduct" },
      { label: "Manage Products", path: "/adminproduct" },
      { label: "Manage Orders", path: "/admin/orders" },
    ],
    seller: [
      { label: "Add Product", path: "/addproduct" },
      { label: "Orders", path: "/seller/orders" },
    ],
    customer: [
      { label: "My Orders", path: "/orders" },
      { label: "My Addresses", path: "/addresses" },
    ],
  };

  return (
    <>
      {/* HEADER */}
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
        {/* MENU */}
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        {/* LOGO */}
        <Typography
          variant="h6"
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/")}
        >
          EasyShop
        </Typography>

        {/* ADDRESS */}
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



        {/*  SEARCH BAR (shadcn styled) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "40%",
            gap: 1,
          }}
        >
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-2 text-sm border rounded-md bg-black relative z-50"
          >
            <option value="all">All</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="electronics">Electronics</option>
          </select>

          {/* Search Input */}
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-black text-white placeholder:text-gray-500 border"
          />

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            🔍
          </Button>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* USER */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <Typography variant="body2">
            {user ? `Hello, ${user.name}` : "Hello, Sign in"}
          </Typography>

          {user ? (
            <Typography sx={{ cursor: "pointer" }} onClick={handleLogout}>
              Logout
            </Typography>
          ) : (
            <Typography sx={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
              Login / Register
            </Typography>
          )}
        </Box>

        {/* CART */}
        <Box
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/cart")}
        >
          🛒 Cart ({cartItems?.length || 0})
        </Box>
      </Box>

      {/* DRAWER */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300 }}>
          <Box sx={{ background: "#232F3E", color: "white", p: 2 }}>
            <Typography variant="h6">
              {user ? `Hello, ${user.name}` : "Hello, Sign in"}
            </Typography>
          </Box>

          {user && roleMenus[role]?.length > 0 && (
            <Box sx={{ p: 2 }}>
              <Typography fontWeight="bold">
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
        </Box>
      </Drawer>
    </>
  );
};

export default memo(Header);