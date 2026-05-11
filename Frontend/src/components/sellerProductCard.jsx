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
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <CardMedia
        component="img"
        height="200"
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

          <Chip
            label={product.status.toUpperCase()}
            color={statusColor(product.status)}
            sx={{ mt: 1 }}
            size="small"
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
        </Box>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {product.status !== "approved" && (
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                navigate(`/seller/product/edit/${product._id}`)
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
