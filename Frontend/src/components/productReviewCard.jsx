import axios from "axios";
import { Card, CardMedia, CardContent, Button, Typography, Box } from "@mui/material";
import { useSelector } from "react-redux";

const ProductReviewCard = ({ product, onAction }) => {
  const token = useSelector((state) => state.user?.token);
  const handleApprove = async () => {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/admin/products/${product._id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    onAction();
  };

  const handleReject = async () => {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/admin/products/${product._id}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    onAction();
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <CardMedia
        component="img"
        height="180"
        image={product.images?.[0]?.url || "/placeholder.png"}
        alt={product.title}
        sx={{ objectFit: "contain", p: 1, bgcolor: "#fafafa" }}
      />
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ minHeight: "48px" }}>
            {product.title}
          </Typography>
          <Typography color="success.main" fontWeight="bold" sx={{ mt: 0.5 }}>
            ₹{product.price}
          </Typography>
        </Box>

        <Box display="flex" gap={1} sx={{ mt: 2 }}>
          <Button variant="contained" color="success" onClick={handleApprove} fullWidth size="small">
            Approve
          </Button>
          <Button variant="contained" color="error" onClick={handleReject} fullWidth size="small">
            Reject
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductReviewCard;
