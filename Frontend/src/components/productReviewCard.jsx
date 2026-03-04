import axios from "axios";
import { Card, CardContent, Button, Typography } from "@mui/material";
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
    <Card>
      <CardContent>
        <Typography variant="h6">{product.title}</Typography>
        <Typography>₹{product.price}</Typography>

        <Button color="success" onClick={handleApprove}>
          Approve
        </Button>
        <Button color="error" onClick={handleReject}>
          Reject
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductReviewCard;
