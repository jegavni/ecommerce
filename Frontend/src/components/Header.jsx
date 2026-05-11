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
/* LIVE SEARCH */
/* SEARCH */
const handleSearch = () => {
  const trimmed = searchTerm.trim();

  if (!trimmed && category === "all") return;

  const query = new URLSearchParams();

  if (trimmed) {
    query.append("keyword", trimmed);
  }

  if (category !== "all") {
    query.append("category", category);
  }

  navigate(`/search?${query.toString()}`);
};

/* LIVE SEARCH */
useEffect(() => {
  const timer = setTimeout(() => {
    handleSearch();
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm, category]);

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
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 2 },
          px: { xs: 1.5, sm: 3 },
          py: 1.5,
        }}
      >
        {/* LEFT SECTION (MENU + LOGO + ADDRESS) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 2 },
            order: 1,
          }}
        >
          {/* MENU */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ color: "white", p: { xs: 0.5, sm: 1 } }}
          >
            <MenuIcon />
          </IconButton>

          {/* LOGO */}
          <Typography
            variant="h6"
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
            onClick={() => navigate("/")}
          >
            EasyShop
          </Typography>

          {/* ADDRESS */}
          {defaultAddress && (
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                cursor: "pointer",
                ml: 1,
              }}
              onClick={() => navigate("/addresses")}
            >
              <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: "#ff9900" }} />
              <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <Typography variant="caption" sx={{ color: "#ccc" }}>
                  Deliver to
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {defaultAddress.name} - {defaultAddress.city}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* MIDDLE SECTION: SEARCH BAR */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", md: "45%" },
            order: { xs: 3, md: 2 },
            gap: 1,
            mt: { xs: 1, md: 0 },
          }}
        >
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-2 text-sm border rounded-md bg-black text-white relative z-50"
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
            className="bg-black text-white placeholder:text-gray-500 border flex-grow"
          />

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="bg-yellow-500 hover:bg-yellow-600 text-black h-10 px-4"
          >
            🔍
          </Button>
        </Box>

        {/* RIGHT SECTION (USER + CART) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 3 },
            order: { xs: 2, md: 3 },
          }}
        >
          {/* USER TAB */}
          {user ? (
            /* ── Logged-in: avatar + name + sign-out ── */
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 2,
                px: { xs: 1, sm: 1.5 },
                py: 0.6,
                transition: "border-color 0.2s, background 0.2s",
                "&:hover": {
                  borderColor: "#f59e0b",
                  background: "rgba(245,158,11,0.08)",
                },
              }}
            >
              {/* Avatar circle */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#fff",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Box>

              {/* Name + Sign out */}
              <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    fontWeight: 700,
                    color: "#fff",
                    maxWidth: { xs: 64, sm: 100 },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  onClick={handleLogout}
                  sx={{
                    fontSize: "0.65rem",
                    color: "#fca5a5",
                    fontWeight: 600,
                    "&:hover": { color: "#ef4444", textDecoration: "underline" },
                    transition: "color 0.15s",
                  }}
                >
                  Sign Out
                </Typography>
              </Box>
            </Box>
          ) : (
            /* ── Guest: Sign In button ── */
            <Box
              onClick={() => navigate("/login")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                cursor: "pointer",
                border: "1.5px solid #f59e0b",
                borderRadius: 2,
                px: { xs: 1.2, sm: 1.8 },
                py: 0.7,
                background: "rgba(245,158,11,0.12)",
                transition: "background 0.2s, transform 0.15s",
                "&:hover": {
                  background: "#f59e0b",
                  transform: "translateY(-1px)",
                  "& .signin-text": { color: "#111" },
                  "& .signin-icon": { color: "#111" },
                },
              }}
            >
              {/* Person icon */}
              <Box
                className="signin-icon"
                sx={{
                  fontSize: 18,
                  color: "#f59e0b",
                  lineHeight: 1,
                  transition: "color 0.2s",
                }}
              >
                👤
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <Typography
                  className="signin-text"
                  sx={{
                    fontSize: "0.65rem",
                    color: "#d1d5db",
                    transition: "color 0.2s",
                  }}
                >
                  Hello, Guest
                </Typography>
                <Typography
                  className="signin-text"
                  sx={{
                    fontSize: { xs: "0.72rem", sm: "0.82rem" },
                    fontWeight: 800,
                    color: "#f59e0b",
                    transition: "color 0.2s",
                  }}
                >
                  Sign In
                </Typography>
              </Box>
            </Box>
          )}

          {/* CART */}
          <Box
            sx={{
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
            onClick={() => navigate("/cart")}
          >
            🛒 <span className="hidden sm:inline">Cart</span> ({cartItems?.length || 0})
          </Box>
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