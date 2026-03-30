import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Container, Card, TextField, Button, Typography } from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/forget/forgot-password`, {
        email,
      });
      toast.success(" Reset link sent to email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          Forgot Password
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Send Reset Link
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
