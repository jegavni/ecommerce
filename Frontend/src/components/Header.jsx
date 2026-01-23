import { AppBar, Toolbar, IconButton, Badge } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const navigate = useNavigate();

  // ✅ Get cart from Redux
  const { items: cart } = useSelector((state) => state.cart);

  // total quantity in cart
  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <h3 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Amazon Clone
        </h3>

        <IconButton color="inherit" onClick={() => navigate("/cart")}>
          <Badge badgeContent={cartCount} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
