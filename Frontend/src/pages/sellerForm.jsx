import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Box, TextField, Button, Typography } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { setUser } from "../Redux/slices/userSlice";

import { useEffect, useState } from "react";

const SellerForm = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    storeName: "",
    gstNumber: "",
    phone: "",
  });

  /* ✅ Redirect safely */
  useEffect(() => {
    if (!user) navigate("/login");
    if (user?.role === "seller") navigate("/seller/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/seller/becomeseller",
        form,
        { withCredentials: true }
      );

      // 🔥 UPDATE REDUX USER
      dispatch(setUser(res.data.user));

      toast.success("Welcome Seller 🎉");
      navigate("/seller/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 3, boxShadow: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Become a Verified Seller
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Shop / Store Name"
          required
          sx={{ mb: 2 }}
          value={form.storeName}
          onChange={(e) =>
            setForm({ ...form, storeName: e.target.value })
          }
        />

        <TextField
          fullWidth
          label="GST / Tax ID"
          sx={{ mb: 2 }}
          value={form.gstNumber}
          onChange={(e) =>
            setForm({ ...form, gstNumber: e.target.value })
          }
        />

        <TextField
          fullWidth
          label="Phone Number"
          required
          sx={{ mb: 2 }}
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <Button
          variant="contained"
          color="warning"
          type="submit"
          fullWidth
        >
          Submit Request
        </Button>
      </form>
    </Box>
  );
};

export default SellerForm;
