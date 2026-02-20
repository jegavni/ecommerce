import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginUser } from "../Redux/slices/userSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const RegisterModal = ({ open, onClose }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Register user
      await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
        { withCredentials: true }
      );

      // ✅ Auto login
      const result = await dispatch(
        loginUser({
          email: form.email,
          password: form.password,
        })
      );

      if (loginUser.fulfilled.match(result)) {
        toast.success("🎉 Account created & logged in!");
        onClose();
      } else {
        toast.info("Registered successfully. Please login.");
      }

    } catch (err) {
      toast.error(
        err.response?.data?.message || "❌ Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6">Create Account</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            value={form.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={form.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            label="Phone"
            name="phone"
            fullWidth
            value={form.phone}
            onChange={handleChange}
            sx={{ mb: 3 }}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default RegisterModal;
