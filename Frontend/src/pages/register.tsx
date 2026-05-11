import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../api/axios";

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    api?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  // Regex patterns
  const nameRegex = /^[A-Za-z ]{3,30}$/;
  const emailRegex = /^\S+@\S+\.\S+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validation
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!nameRegex.test(form.name)) {
      newErrors.name = "Name must be 3–30 letters only";
    }

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be at least 6 characters with letters & numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      const response = await axios.post("/api/auth/register", form);

      console.log("Registered:", response.data);

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error: any) {
      setErrors({
        api: error.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="p-8 max-w-md w-full bg-white rounded-2xl border shadow-sm">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className={`border p-2.5 rounded-lg text-sm ${
                errors.name ? "border-red-500 focus:outline-red-500" : "focus:outline-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={`border p-2.5 rounded-lg text-sm ${
                errors.email ? "border-red-500 focus:outline-red-500" : "focus:outline-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`border p-2.5 rounded-lg text-sm ${
                errors.password ? "border-red-500 focus:outline-red-500" : "focus:outline-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          {/* API Error */}
          {errors.api && (
            <p className="text-red-500 text-sm text-center">
              {errors.api}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white p-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 text-sm mt-2"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <span
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;