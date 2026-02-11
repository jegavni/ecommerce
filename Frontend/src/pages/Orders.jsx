import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../utils/axiosInstance";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
} from "@mui/material";

const Orders = () => {
  const {user,token}  = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/orders/users/${user._id}`,
          {
            headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <Typography>Loading orders...</Typography>;
      if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3}>
        📦 My Orders
      </Typography>

    

      {orders.length === 0 && (
        <Typography align="center" mt={5}>
          🛒 You haven’t placed any orders yet
        </Typography>
      )}

      {orders.map((order) => (
        <Card key={order._id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography fontWeight="bold">
              Order ID: {order._id}
            </Typography>
            <Typography>Status: {order.status}</Typography>
            <Typography>
              Date: {new Date(order.createdAt).toLocaleDateString()}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {order.items.map((item, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography>{item.title}</Typography>
                <Typography>
                  ₹{item.price} × {item.qty}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography color="success.main" fontWeight="bold">
              Total: ₹{order.totalAmount}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default Orders;
