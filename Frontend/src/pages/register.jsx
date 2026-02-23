import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  Container,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Box,
} from "@mui/material";

import { loginUser } from "../Redux/slices/userSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* =======================
     VALIDATION REGEX
  ======================= */
  const nameRegex = /^[a-zA-Z ]{2,30}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  /* =======================
     VALIDATE SINGLE FIELD
  ======================= */
  const validateField = (field, value) => {
    let errorMsg = "";

    switch (field) {
      case "name":
        if (!nameRegex.test(value)) {
          errorMsg = "Name must be 2-30 letters only";
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
            "Min 6 chars with uppercase, lowercase, number & symbol";
        }
        break;

      case "phone":
        if (!phoneRegex.test(value)) {
          errorMsg = "Enter valid 10-digit phone number";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  /* =======================
     HANDLE INPUT CHANGE
  ======================= */
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  /* =======================
     FINAL FORM CHECK
  ======================= */
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

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("❌ Please fix errors before submitting");
      return;
    }

    try {
      setLoading(true);

      // ✅ Register user
      await axios.post(
`${import.meta.env.VITE_API_URL}/api/auth/register`,
        form,
        { withCredentials: true }
      );

      // ✅ Auto login using Redux
      const result = await dispatch(
        loginUser({
          email: form.email,
          password: form.password,
        })
      );

      if (loginUser.fulfilled.match(result)) {
        toast.success("🎉 Account created & logged in!");
        navigate("/");
      } else {
        toast.info("Registered! Please login.");
        navigate("/login");
      }

    } catch (err) {
      toast.error(
        err.response?.data?.message || "❌ Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Typography
            variant="h4"
            textAlign="center"
            mb={3}
            color="primary"
          >
            Create Account
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={(e) =>
                handleChange("name", e.target.value.trimStart())
              }
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={(e) =>
                handleChange("email", e.target.value.trim())
              }
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={(e) =>
                handleChange("password", e.target.value)
              }
              error={!!errors.password}
              helperText={
                errors.password ||
                "Min 6 chars with uppercase, number, symbol"
              }
            />

            <TextField
              label="Phone Number"
              type="tel"
              fullWidth
              margin="normal"
              value={form.phone}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
              error={!!errors.phone}
              helperText={errors.phone || "10-digit phone number"}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, py: 1.3 }}
              disabled={loading || !validateForm()}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>

            <Typography textAlign="center" mt={2}>
              Already have an account?
            </Typography>

            <Button
              fullWidth
              variant="outlined"
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
