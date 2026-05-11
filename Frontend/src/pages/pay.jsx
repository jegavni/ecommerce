import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PayPage = () => {
  const [amount, setAmount] = useState("");
  const { user, token } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!user) {
      toast.info("Please login first");
      navigate("/login");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    if (amount > user.wallet) {
      toast.error("Insufficient wallet balance");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wallet/pay`,
        { amount: Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Payment Successful");
      setAmount("");

    } catch (error) {
      toast.error(error.response?.data?.message || "Payment Failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Pay & Recharge</h1>

      {/* Wallet Card */}
      <Card className="rounded-2xl border shadow-sm bg-white">
        <CardContent className="p-6">
          <p className="text-sm text-gray-500 font-medium">Wallet Balance</p>
          <p className="text-3xl font-extrabold text-green-600 mt-2">
            ₹{user?.wallet || 0}
          </p>
        </CardContent>
      </Card>

      {/* Payment Card */}
      <Card className="rounded-2xl border shadow-sm bg-white">
        <CardContent className="space-y-4 p-6">
          <label className="block text-sm font-medium text-gray-700">Recharge Amount</label>
          <Input
            type="number"
            placeholder="Enter amount (e.g. 500)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />

          <Button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition" onClick={handlePayment}>
            Recharge Now
          </Button>
        </CardContent>
      </Card>

    </div>
  );
};

export default PayPage;
