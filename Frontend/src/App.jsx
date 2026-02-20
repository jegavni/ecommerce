import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setUser } from "./Redux/slices/userSlice.js";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/productDetails.jsx";
import AddProduct from "./components/AddProduct.jsx";
import SellerForm from "./pages/sellerForm";
import AdminProduct from "./pages/AdminProduct";
import ProtectedRoute from "./components/protectedRoute";
import PayPage from "./pages/Pay";
import SellerDashboard from "./pages/sellerDashboard";
import Search from "./pages/search.jsx";  
import RecentlyViewedPage from "./pages/recentlViewed.jsx";

function App() {
  const dispatch = useDispatch();

  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState([]);

  // ===== CHECK AUTH =====
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/me",
          { withCredentials: true }
        );
        dispatch(setUser(res.data.user));
      } catch {
        dispatch(setUser(null));
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [dispatch]);

  // ===== FETCH PRODUCTS ONCE =====
  useEffect(() => {
    axios.get("http://localhost:5000/api/products").then((res) => {
      setProducts(res.data.products || []);
    });
  }, []);

  if (!authChecked) return null;

  return (
    <>
      {/* HEADER RENDERS ONCE */}

      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home products={products} />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/seller/product/edit/:id" element={<AddProduct />} />
          <Route path="/sellerForm" element={<SellerForm />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/adminproduct" element={<AdminProduct />} />
          <Route path="/pay" element={<PayPage />} />
          <Route path="/search" element={<Search products={products} />} />
          <Route path="/recentlyViewed" element={<RecentlyViewedPage />} />

        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default App;
