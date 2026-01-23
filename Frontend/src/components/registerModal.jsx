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
import { useUser } from "../context/userContext";

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
  const { login } = useUser();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", form);

      toast.success("🎉 Registration successful!");
      login(res.data.user); // log in user after registration
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">Register</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
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
            sx={{ mb: 3 }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default RegisterModal;
