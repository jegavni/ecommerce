import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import {
  Container,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { loginUser } from "../Redux/slices/userSlice";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const emailRef = useRef(null);

  const { user, loading, error } = useSelector((state) => state.user);

  const redirectPath = location.state?.from || "/";

  /* ===== AUTOFOCUS EMAIL ===== */
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  /* ===== LOAD SAVED EMAIL ===== */
  useEffect(() => {
    const savedEmail = localStorage.getItem("lastEmail");
    if (savedEmail) {
      setForm((f) => ({ ...f, email: savedEmail }));
    }
  }, []);

  /* ===== SUCCESS LOGIN ===== */
  useEffect(() => {
    if (user) {
      toast.success("✅ Login successful");
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  /* ===== ERROR HANDLING ===== */
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  /* ===== SUBMIT ===== */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("❌ Please fill all fields");
      return;
    }

    localStorage.setItem("lastEmail", form.email);
    dispatch(loginUser(form));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" mb={3} color="primary">
            🔐 Login
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              inputRef={emailRef}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography textAlign="right" mt={1} mb={1}>
              <Link
                to="/ForgotPassword"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Forgot Password?
              </Link>
            </Typography>

            <Button
  type="submit"
  fullWidth
  variant="contained"
  disableElevation
  sx={{
    mt: 2,
    py: 1.3,
    backgroundColor: "#1976d2",
    color: "#fff",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#1565c0",
    },
    "&.Mui-disabled": {
      backgroundColor: "#90caf9",
      color: "#fff",
    },
  }}
  disabled={loading || !form.email || !form.password}
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