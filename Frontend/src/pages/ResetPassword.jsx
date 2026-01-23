import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Container, Card, TextField, Button, Typography } from "@mui/material";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/api/forget/reset-password/${token}`,
        { password }
      );
      toast.success("✅ Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error("❌ Invalid or expired link");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Reset Password
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default ResetPassword;
