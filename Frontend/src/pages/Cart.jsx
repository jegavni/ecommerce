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

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  /* =======================
     FETCH ADDRESSES
  ======================= */
  useEffect(() => {
    if (!user?._id) return;

    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);

        const res = await axios.get(
          `http://localhost:5000/api/users/${user._id}/addresses`
        );

        const addressList = res.data.addresses || res.data || [];

        setAddresses(addressList);

        const defaultAddress =
          addressList.find((a) => a.isDefault) || addressList[0] || null;

        setSelectedAddress(defaultAddress);
      } catch (err) {
        toast.error("❌ Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user?._id]);


  /* =======================
     ADD / EDIT ADDRESS
  ======================= */
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setOpenAddressModal(true);
  };

  const handleAddAddress = async (addressData) => {
    try {
      if (editingAddress) {
        const res = await axios.put(
          `http://localhost:5000/api/users/${user._id}/addresses/${editingAddress._id}`,
          addressData
        );

        setAddresses(res.data.addresses);
        toast.success("✅ Address updated");
      } else {
        const res = await axios.post(
          `http://localhost:5000/api/users/${user._id}/addresses`,
          addressData
        );

        setAddresses(res.data.addresses);
        toast.success("✅ Address added");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setOpenAddressModal(false);
      setEditingAddress(null);
    }
  };

  /* =======================
     PLACE ORDER
  ======================= */
  const makePayment = async () => {
    if (!user) return toast.error("❌ Please login");

    if (!selectedAddress)
      return toast.error("❌ Please select a delivery address");

    try {
      // 1️⃣ Create Razorpay Order from backend
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        { amount: totalAmount }
      );

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,


        handler: async function (response) {
          // 2️⃣ After Successful Payment → Save Order in DB
          await axios.post("http://localhost:5000/api/orders", {
            userId: user._id,
            items: cart.map((item) => ({
              productId: item._id,
              title: item.title,
              price: Number(item.price),
              qty: Number(item.qty),
            })),
            address: selectedAddress,
            totalAmount,
            paymentMethod: "Razorpay",
            paymentStatus: "PAID",
            razorpayPaymentId: response.razorpay_payment_id,
          });

          toast.success("🎉 Payment Successful & Order Placed!");
          dispatch(clearCart());
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
      rzp.open();
    } catch (err) {
      toast.error("❌ Payment Failed");
    }
  };


  /* =======================
     EMPTY CART
  ======================= */
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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

      {/* PLACE ORDER */}
      <Button
        variant="contained"
        color="success"
        fullWidth
        sx={{ mt: 3, py: 1.5 }}
        onClick={makePayment}
      >
        Pay Now
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
