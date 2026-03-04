import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { getCurrentUser } from "./Redux/slices/userSlice";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/productDetails.jsx";
import AddProduct from "./components/AddProduct.jsx";
import SellerForm from "./pages/sellerForm";
import AdminProduct from "./pages/AdminProduct";
import ProtectedRoute from "./components/protectedRoute";
import PayPage from "./pages/pay";
import SellerDashboard from "./pages/sellerDashboard";
import Search from "./pages/search.jsx";
import RecentlyViewedPage from "./pages/recentlViewed.jsx";
import API from "./api/axios";



function App() {

  const [products, setProducts] = useState([]);

  /* ===== AUTH CHECK ON APP START ===== */
  

  /* ===== FETCH PRODUCTS ===== */
  useEffect(() => {
    API.get("/api/products").then((res) => {
      setProducts(res.data.products || []);
    });
  }, []);

  /* ===== WAIT FOR AUTH CHECK ===== */
  

  return (
    <>
      <Routes>

  {/* PUBLIC */}
  <Route path="/" element={<Home products={products} />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/ForgotPassword" element={<ForgotPassword />} />
  <Route path="/product/:id" element={<ProductDetails />} />
  <Route path="/search" element={<Search products={products} />} />

  {/* PROTECTED */}
  <Route element={<ProtectedRoute />}>
    <Route path="/orders" element={<Orders />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/pay" element={<PayPage />} />
    <Route path="/addproduct" element={<AddProduct />} />
    <Route path="/seller/product/edit/:id" element={<AddProduct />} />
    <Route path="/sellerForm" element={<SellerForm />} />
    <Route path="/seller/dashboard" element={<SellerDashboard />} />
    <Route path="/adminproduct" element={<AdminProduct />} />
    <Route path="/recentlyViewed" element={<RecentlyViewedPage />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
  </Route>

</Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}

export default App;