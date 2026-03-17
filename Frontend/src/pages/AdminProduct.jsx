import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Typography, Grid, CircularProgress } from "@mui/material";
import ProductReviewCard from "../components/productReviewCard";
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.user?.user);
  const token = useSelector((state) => state.user?.token);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ADMIN CHECK:", user, token);

  if (!user || user.role !== "admin" || !token) {
    console.log("Blocked: not admin or no token");
    setLoading(false);
    return;
  }
    if (!user || user.role !== "admin" || !token) {
      setLoading(false);
      return;
    }

    const fetchPending = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/products/pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(data);
        console.log("Fetched pending products:", data);
      } catch (err) {
        console.error("Failed to load pending products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [token, user]);

  if (loading) return <CircularProgress />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pending Product Approvals
      </Typography>

      {products.length === 0 && (
        <Typography>No pending products 🎉</Typography>
      )}

      <Grid container spacing={3}>
  {products.map((product) => (
    <Grid item xs={12} md={4} key={product._id}>
      <ProductReviewCard
        product={product}
        onAction={() =>
          setProducts((prev) =>
            prev.filter((p) => p._id !== product._id)
          )
        }
      />

      {/* ✅ EDIT BUTTON */}
      <Button
        variant="contained"
        size="small"
        sx={{ mt: 1 }}
        onClick={() => navigate(`/admin/product/edit/${product._id}`)}
      >
        Edit
      </Button>
    </Grid>
  ))}
</Grid>

    </Container>
  );
};

export default AdminProducts;
