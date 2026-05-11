// Cart.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import AddressSelector from "../components/AddressSelector";
import AddAddressModal from "../components/AddAddressModal";

import {
  Container,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Box,
  Button,
  Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";
import { toast } from "react-toastify";

import {
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
} from "../Redux/slices/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();

  const { items: cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  /* =========================
     FETCH ADDRESSES
  ========================== */
  useEffect(() => {
    if (!user?._id) return;

    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${user._id}/addresses`
        );

        const addressList = res.data.addresses || res.data || [];

        setAddresses(addressList);

        const defaultAddress =
          addressList.find((a) => a.isDefault) || addressList[0] || null;

        setSelectedAddress(defaultAddress);
      } catch (err) {
        toast.error(" Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user?._id]);

  /* =========================
     SAVE ORDER (Reusable)
  ========================== */
  const saveOrder = async ({
    paymentMethod,
    paymentStatus,
    razorpayPaymentId = null,
  }) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, {
      userId: user._id,
      items: cart.map((item) => ({
        productId: item._id,
        title: item.title,
        price: Number(item.price),
        qty: Number(item.qty),
      })),
      address: selectedAddress,
      totalAmount,
      paymentMethod,
      paymentStatus,
      razorpayPaymentId,
    });

    dispatch(clearCart());
  };

  /* =========================
     ONLINE PAYMENT
  ========================== */
  const makePayment = async () => {
    if (!user) return toast.error(" Please login");
    if (!selectedAddress)
      return toast.error(" Please select delivery address");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        { amount: totalAmount }
      );

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,

        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verifyRes.data.success) {
              await saveOrder({
                paymentMethod: "Razorpay",
                paymentStatus: "PAID",
                razorpayPaymentId: response.razorpay_payment_id,
              });

              toast.success(" Payment Successful & Order Placed!");
            }
          } catch (err) {
            console.error("PAYMENT FLOW ERROR:", err.response?.data || err);
            toast.error(err.response?.data?.message || err.message || " Payment verification failed");
          }
        },

        prefill: {
          name: user.name,
          email: user.email,
        },

        theme: {
          color: "#1976d2",
        },
      };
      console.log("RAZORPAY DATA:", data);
console.log("OPTIONS:", options);

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
  console.log("FAILED:", response.error);

  toast.error(
    response.error.description || "Payment failed"
  );
});

      rzp.on("modal.closed", function () {
        toast.error(" Payment cancelled");
      });

      rzp.open();
    } catch (err) {
      toast.error(" Payment initialization failed");
    }
  };

  /* =========================
     CASH ON DELIVERY
  ========================== */
  const placeCODOrder = async () => {
    if (!user) return toast.error(" Please login");
    if (!selectedAddress)
      return toast.error(" Please select delivery address");

    try {
      await saveOrder({
        paymentMethod: "COD",
        paymentStatus: "PENDING",
      });

      toast.success(" Order placed with Cash on Delivery!");
    } catch (err) {
      toast.error(" Failed to place order");
    }
  };

  /* =========================
     ADDRESS HANDLERS
  ========================== */
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setOpenAddressModal(true);
  };

  const handleAddAddress = async (addressData) => {
    try {
      let res;

      if (editingAddress) {
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/${user._id}/addresses/${editingAddress._id}`,
          addressData
        );
        toast.success(" Address updated");
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/${user._id}/addresses`,
          addressData
        );
        toast.success(" Address added");
      }

      setAddresses(res.data.addresses);
    } catch (err) {
      toast.error(" Failed to save address");
    } finally {
      setOpenAddressModal(false);
      setEditingAddress(null);
    }
  };

  /* =========================
     EMPTY CART
  ========================== */
  if (cart.length === 0) {
    return (
      <Typography variant="h5" textAlign="center" mt={5}>
        🛒 Your cart is empty
      </Typography>
    );
  }

  return (
    <Container sx={{ mt: { xs: 2, sm: 4 }, mb: 8, px: { xs: 1.5, sm: 3 } }}>
      <Typography
        variant="h4"
        mb={3}
        sx={{
          fontSize: { xs: "1.8rem", sm: "2.2rem" },
          fontWeight: "bold",
        }}
      >
        Your Cart
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: Items and Address */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" mb={2} sx={{ fontWeight: "bold" }}>
            Cart Items ({cart.length})
          </Typography>

          <Grid container spacing={2}>
            {cart.map((item) => (
              <Grid item xs={12} key={item._id}>
                <Card sx={{ borderRadius: 2, border: "1px solid #e2e8f0", boxShadow: "none" }}>
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                      "&:last-child": { pb: 2 },
                    }}
                  >
                    {/* Item Info */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                      <img
                        src={item.images?.[0]?.url || item.image || "/placeholder.png"}
                        alt={item.title}
                        style={{
                          width: "64px",
                          height: "64px",
                          objectFit: "contain",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "8px",
                          padding: "4px",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight="bold" sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem" } }}>
                          {item.title}
                        </Typography>
                        <Typography color="success.main" sx={{ fontWeight: "bold", mt: 0.5 }}>
                          ₹{item.price}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Quantity & Action Group */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{
                          bgcolor: "#f0f2f2",
                          borderRadius: "8px",
                          border: "1px solid #d5d9d9",
                          p: 0.5,
                        }}
                      >
                        <IconButton
                          disabled={item.qty === 1}
                          onClick={() => dispatch(decreaseQty(item._id))}
                          size="small"
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>

                        <Typography sx={{ fontWeight: "bold", px: 1 }}>{item.qty}</Typography>

                        <IconButton
                          onClick={() => dispatch(increaseQty(item._id))}
                          size="small"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <IconButton
                        color="error"
                        onClick={() => dispatch(removeFromCart(item._id))}
                        size="medium"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ADDRESS SECTION */}
          <Box mt={4}>
            <Typography variant="h6" mb={2} sx={{ fontWeight: "bold" }}>
              Delivery Address
            </Typography>

            {loadingAddresses ? (
              <Typography>Loading addresses...</Typography>
            ) : addresses.length === 0 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenAddressModal(true)}
                sx={{ borderRadius: 2 }}
              >
                ➕ Add Address
              </Button>
            ) : (
              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddress?._id}
                onSelect={setSelectedAddress}
                onAddNew={() => {
                  setEditingAddress(null);
                  setOpenAddressModal(true);
                }}
                onEdit={handleEditAddress}
              />
            )}
          </Box>
        </Grid>

        {/* RIGHT COLUMN: Order Summary Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              position: "sticky",
              top: 20,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography variant="h6" mb={2} sx={{ fontWeight: "bold" }}>
              Order Summary
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography color="text.secondary">Items Total:</Typography>
              <Typography fontWeight="bold">₹{totalAmount}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography color="text.secondary">Delivery Charge:</Typography>
              <Typography fontWeight="bold" color="success.main">
                FREE
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Total Amount:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "black", color: "#b12704" }}>
                ₹{totalAmount}
              </Typography>
            </Box>

            {/* PAYMENT METHOD */}
            <Box mb={4}>
              <Typography variant="body2" mb={1} sx={{ fontWeight: "bold", color: "text.secondary" }}>
                Payment Method
              </Typography>

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Button
                  variant={paymentMethod === "ONLINE" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setPaymentMethod("ONLINE")}
                  sx={{ borderRadius: 2, py: 1 }}
                  fullWidth
                >
                  💳 Pay Online
                </Button>

                <Button
                  variant={paymentMethod === "COD" ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setPaymentMethod("COD")}
                  sx={{ borderRadius: 2, py: 1 }}
                  fullWidth
                >
                  💵 Cash on Delivery
                </Button>
              </Box>
            </Box>

            {/* PLACE ORDER */}
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{
                py: 1.8,
                borderRadius: 2,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
              }}
              disabled={!selectedAddress || loadingAddresses}
              onClick={() => (paymentMethod === "ONLINE" ? makePayment() : placeCODOrder())}
            >
              {paymentMethod === "ONLINE" ? "Proceed to Pay" : "Place Order (COD)"}
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* ADDRESS MODAL */}
      <AddAddressModal
        open={openAddressModal}
        onClose={() => {
          setOpenAddressModal(false);
          setEditingAddress(null);
        }}
        onSave={handleAddAddress}
        initialData={editingAddress}
      />
    </Container>
  );
};

export default Cart;