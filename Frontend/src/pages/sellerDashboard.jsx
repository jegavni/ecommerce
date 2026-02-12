import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Typography,
  Container,
  CircularProgress,
} from "@mui/material";
import SellerProductCard from "../components/sellerProductCard";
import AddProductForm from "../components/AddProduct"; // your add product form
import { useSelector } from "react-redux";

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.user); // assuming user state
const fetchMyProducts = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/products/my",
          { withCredentials: true } // send cookies automatically
        );
        setProducts(data);
      } catch (err) {
        console.error(err);
        setProducts([]); // fail safe
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    if (user?.role === "seller") {
      fetchMyProducts();
    }

  }, [user]);
    



  if (loading) return <CircularProgress />;

  return (
    <Container sx={{ mt: 4 }}>
      {products.length > 0 ? (
        <>
          <Typography variant="h4" gutterBottom>
            My Products
          </Typography>
          <Grid container spacing={3}>
            {products
              .filter(p => p && p._id)
              .map((product) => (

                <Grid item xs={12} md={4} key={product._id}>
                  <SellerProductCard product={product} />
                </Grid>
              ))}
          </Grid>
        </>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            No Products Found
          </Typography>
          <Typography mb={2}>
            Add your first product below:
          </Typography>
          <AddProductForm setProducts={setProducts} />
        </>
      )}
    </Container>
  );
};

export default SellerDashboard;
