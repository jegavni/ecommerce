import { AppBar, Toolbar, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide header on scroll down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const menuItems = [
    { name: "Pay", color: "#f44336" },       // red
    { name: "Fresh", color: "#4caf50" },     // green
    { name: "Bazaar", color: "#ff9800" },    // orange
    { name: "MX Player", color: "#2196f3" }, // blue
    { name: "Pharmacy", color: "#9c27b0" },  // purple
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        transition: "top 0.3s",
        top: showHeader ? 0 : "-64px",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ padding: 0 }}>
        {menuItems.map((item) => (
          <Box
            key={item.name}
            sx={{
              flex: 1,
              textAlign: "center",
              padding: "12px 0",
              backgroundColor: item.color,
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
              transition: "opacity 0.2s",
            }}
            onClick={() => navigate(`/${item.name.toLowerCase()}`)}
          >
            <Typography sx={{ color: "#fff", fontWeight: 500 }}>
              {item.name}
            </Typography>
          </Box>
        ))}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
