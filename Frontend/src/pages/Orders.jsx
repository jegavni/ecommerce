import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/userContext";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
} from "@mui/material";

const Orders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders/users/${user._id}`
        );
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3}>
        📦 My Orders
      </Typography>

      {orders.length === 0 && (
        <Typography>No orders found</Typography>
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
