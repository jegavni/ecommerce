import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

import {
  Container,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Box,
} from "@mui/material";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Regex patterns
  const nameRegex = /^[a-zA-Z ]{2,30}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  // Real-time validation function
  const validateField = (field, value) => {
    let errorMsg = "";

    switch (field) {
      case "name":
        if (!nameRegex.test(value)) {
          errorMsg = "Name must be 2-30 letters and spaces only";
        }
        break;
      case "email":
        if (!emailRegex.test(value)) {
          errorMsg = "Enter a valid email address";
        }
        break;
      case "password":
        if (!passwordRegex.test(value)) {
          errorMsg =
            "Password must be 6+ chars, with uppercase, lowercase, number & special char";
        }
        break;
      case "phone":
        if (!phoneRegex.test(value)) {
          errorMsg = "Enter a valid 10-digit phone number";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  // Handle input change
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    validateField(field, value);
  };

  // Final validation before submit
  const validateForm = () => {
    return (
      !errors.name &&
      !errors.email &&
      !errors.password &&
      !errors.phone &&
      form.name &&
      form.email &&
      form.password &&
      form.phone
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("❌ Please fix errors before submitting");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/register", form);
      toast.success("✅ Registered successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" mb={3} color="primary">
            📝 Create Account
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={!!errors.password}
              helperText={errors.password || "Min 6 chars, uppercase, number, special"}
            />

            <TextField
              label="Phone Number"
              type="tel"
              fullWidth
              margin="normal"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone || "10-digit phone number"}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.3 }}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>

            <Typography textAlign="center" mt={2}>
              Already have an account?
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ mt: 1 }}
              component={Link}
              to="/login"
            >
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
