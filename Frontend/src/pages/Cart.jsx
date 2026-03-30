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
          await saveOrder({
            paymentMethod: "Razorpay",
            paymentStatus: "PAID",
            razorpayPaymentId: response.razorpay_payment_id,
          });

          toast.success(" Payment Successful & Order Placed!");
        },

        prefill: {
          name: user.name,
          email: user.email,
        },

        theme: {
          color: "#1976d2",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function () {
        toast.error("Payment failed");
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3}>
        Your Cart
      </Typography>

      {/* CART ITEMS */}
      <Grid container spacing={2}>
        {cart.map((item) => (
          <Grid item xs={12} key={item._id}>
            <Card>
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography fontWeight="bold">{item.title}</Typography>
                  <Typography color="success.main">
                    ₹{item.price}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    disabled={item.qty === 1}
                    onClick={() => dispatch(decreaseQty(item._id))}
                  >
                    <RemoveIcon />
                  </IconButton>

                  <Typography>{item.qty}</Typography>

                  <IconButton
                    onClick={() => dispatch(increaseQty(item._id))}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                <IconButton
                  color="error"
                  onClick={() =>
                    dispatch(removeFromCart(item._id))
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ADDRESS SECTION */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Delivery Address
        </Typography>

        {loadingAddresses ? (
          <Typography>Loading addresses...</Typography>
        ) : addresses.length === 0 ? (
          <Button
            variant="contained"
            onClick={() => setOpenAddressModal(true)}
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

      {/* TOTAL */}
      <Typography
        variant="h5"
        textAlign="right"
        fontWeight="bold"
        mt={3}
      >
        Total: ₹{totalAmount}
      </Typography>

      {/* PAYMENT METHOD */}
      <Box mt={3}>
        <Typography variant="h6">Payment Method</Typography>

        <Box display="flex" gap={2} mt={1}>
          <Button
            variant={paymentMethod === "ONLINE" ? "contained" : "outlined"}
            onClick={() => setPaymentMethod("ONLINE")}
          >
            Pay Online
          </Button>

          <Button
            variant={paymentMethod === "COD" ? "contained" : "outlined"}
            onClick={() => setPaymentMethod("COD")}
          >
            Cash on Delivery
          </Button>
        </Box>
      </Box>

      {/* PLACE ORDER */}
      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 3, py: 1.5 }}
        disabled={!selectedAddress || loadingAddresses}
        onClick={() =>
          paymentMethod === "ONLINE"
            ? makePayment()
            : placeCODOrder()
        }
      >
        {paymentMethod === "ONLINE"
          ? "Pay Now"
          : "Place Order (COD)"}
      </Button>

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