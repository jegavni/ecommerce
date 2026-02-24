import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

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

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.user);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("❌ Please fill all fields");
      return;
    }

    dispatch(loginUser(form));
  };

  // ✅ Handle success
  useEffect(() => {
    if (user) {
      toast.success("✅ Login successful");
      navigate("/");
    }
  }, [user, navigate]);

  // ❌ Handle error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" mb={3} color="primary">
            🔐 Login
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              margin="normal"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <Typography textAlign="right" mt={1} mb={1}>
              <Link
                to="/forgot-password"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Forgot Password?
              </Link>
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, py: 1.3 }}
              disabled={logiLoading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Typography textAlign="center" mt={2}>
              Don&apos;t have an account?
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ mt: 1 }}
              component={Link}
              to="/register"
            >
              Create Account
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
