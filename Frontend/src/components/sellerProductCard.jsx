import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const statusColor = status => {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "error";
};

const SellerProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardMedia
        component="img"
        height="200"
        image={product.images[0]}
        alt={product.title}
      />

      <CardContent>
        <Typography variant="h6">{product.title}</Typography>
        <Typography>₹{product.price}</Typography>

        <Chip
          label={product.status.toUpperCase()}
          color={statusColor(product.status)}
          sx={{ mt: 1 }}
        />

        {product.status === "rejected" && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 1 }}
          >
            Reason: {product.rejectionReason}
          </Typography>
        )}

        <Stack spacing={2} sx={{ mt: 2 }}>
          {product.status !== "approved" && (
            <Button
              variant="outlined"
              onClick={() =>
                navigate(`/seller/products/edit/${product._id}`)
              }
            >
              Edit & Resubmit
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SellerProductCard;
