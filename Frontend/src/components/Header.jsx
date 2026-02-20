import { useState, useEffect, memo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/slices/userSlice";
import RegisterModal from "./registerModal";

/* ===== ROLE BASED MENU ===== */
const drawerMenuByRole = {
  admin: [
    { label: "Home", path: "/", section: "home" },
    { label: "Pending Products", path: "/adminproduct", section: "pending" },
    { label: "Users", path: "/admin/users", section: "users" },
    { label: "Orders", path: "/admin/orders", section: "adminOrders" }
  ],

  seller: [
    { label: "Home", path: "/", section: "home" },
    { label: "My Products", path: "/addproduct", section: "sellerProducts" },
    { label: "Orders", path: "/seller/orders", section: "sellerOrders" }
  ],

  user: [
    { label: "Home", path: "/", section: "home" },
    { label: "Your Orders", path: "/orders", section: "orders" },
    { label: "Your Cart", path: "/cart", section: "cart" }
  ],

  guest: [
    { label: "Home", path: "/", section: "home" }
  ]
};

const Header = ({ products, activeSection, setActiveSection }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);

  const role = user?.role || "guest";
  const menuItems = drawerMenuByRole[role];

  /* ===== AUTO SYNC ACTIVE SECTION WITH URL ===== */
  useEffect(() => {
    const current = menuItems.find(item => item.path === location.pathname);
    if (current) setActiveSection(current.section);
  }, [location.pathname]);

  /* ===== SEARCH WITH DEBOUNCE ===== */
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!search.trim()) {
        setSuggestions([]);
        return;
      }

      const q = search.toLowerCase();

      const filtered = products
        .filter(
          p =>
            p.title?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        )
        .slice(0, 5);

      setSuggestions(filtered);
    }, 300);

    return () => clearTimeout(delay);
  }, [search, products]);

  const handleLogout = () => {
    dispatch(logout());
    setDrawerOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${search}`);
      setSuggestions([]);
    }
  };

  return (
    <>
      {/* ===== HEADER BAR ===== */}
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
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white" }}>
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          inskart
        </Typography>

        <Box sx={{ flex: 1, position: "relative" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />

          {suggestions.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 40,
                width: "100%",
                bgcolor: "white",
                boxShadow: 3,
                borderRadius: 1,
                zIndex: 10
              }}
            >
              {suggestions.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    p: 1,
                    cursor: "pointer",
                    color: "black",
                    "&:hover": { bgcolor: "grey", color: "white" }
                  }}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  {item.title}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ fontSize: 12 }}>
          {user ? (
            <>
              <div>Hello, {user.name}</div>
              <Button onClick={handleLogout} sx={{ color: "white", p: 0 }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <div>Hello, sign in</div>
              <Button onClick={() => setOpenRegister(true)} sx={{ color: "white", p: 0 }}>
                Register
              </Button>
            </>
          )}
        </Box>

        <Box
          sx={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => navigate("/cart")}
        >
          🛒 Cart ({cartItems.length})
        </Box>
      </Box>

      {/* ===== SIDE DRAWER ===== */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }}>
          <Box
            sx={{
              backgroundColor: "#232f3e",
              color: "white",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Typography variant="subtitle1">
              {user ? `Hello, ${user.name}` : "Welcome"}
            </Typography>

            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {menuItems.map((item) => {
              const isActive = activeSection === item.section;

              return (
                <ListItem
                  button
                  key={item.path}
                  onClick={() => {
                    setActiveSection(item.section);
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                  sx={{
                    bgcolor: isActive ? "#e3f2fd" : "transparent",
                    color: isActive ? "#1976d2" : "inherit"
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItem>
              );
            })}

            <Divider />

            {!user ? (
              <ListItem button onClick={() => setOpenRegister(true)}>
                <ListItemText primary="Sign In / Register" />
              </ListItem>
            ) : (
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      <RegisterModal open={openRegister} onClose={() => setOpenRegister(false)} />
    </>
  );
};

export default memo(Header);
