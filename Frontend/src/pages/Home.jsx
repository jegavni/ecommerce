import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AIShopAssistant from "../components/AIShopAssistant";

import Header from "../components/Header";
import { HomeSection } from "../components/HomeSection.jsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { addToCart } from "../Redux/slices/cartSlice";
import { Rating } from "@mui/material";

const HomePage = ({ products = [] }) => {
  const [activeSection, setActiveSection] = useState("home");
  const [pendingProducts, setPendingProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.user);

  /* ===== FETCH RECENTLY VIEWED ===== */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/recentlyViewed`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(setRecentlyViewed)
      .catch(console.error);
  }, []);

  /* ===== FETCH ADMIN PENDING PRODUCTS ===== */
  useEffect(() => {
    if (activeSection === "pending" && user?.role === "admin") {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/admin/products/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setPendingProducts(res.data))
        .catch(console.error);
    }
  }, [activeSection, user, token]);

  /* ===== ADD TO CART ===== */
  const handleAddToCart = (product) => {
    if (!user) {
      toast.info("Please login first");
      navigate("/login");
      return;
    }
    dispatch(addToCart(product));
    toast.success("Added to cart");
  };

  return (
    <div className="pb-20">

      {/* HEADER CONTROLS SECTION */}
      <Header
        products={products}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* ================= HOME SECTION ================= */}
      {activeSection === "home" && (
        <>
          {/* CATEGORY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
            {user && (
              <HomeSection
                title="Pick up where you left off"
                products={recentlyViewed}
              />
            )}
            <HomeSection title="Keep shopping for" />
            {user && (
              <HomeSection title="Recommended for you" products={products} />
            )}
            {user && (
              <HomeSection title="Buy again" products={products} />
            )}

            {user && (
              <HomeSection title="deals and offers" products={products} />
            )}


          </div>

          {/* HERO BANNER */}
          <div className="bg-white rounded-xl p-4 flex items-center justify-between
                shadow-md transition-all duration-300
                animate-float">
            <div className="bg-white rounded-xl p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Get set & fly to Dubai</h2>
                <p className="text-sm text-gray-600">Starting ₹7,599</p>
              </div>
              <img
                src="https://picsum.photos/400/300"
                className="h-20 object-contain"
                alt="banner"
              />
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="w-full px-4 py-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => {
                const discount = product.mrp
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  : 0;

                return (
                  <Card
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="
    relative rounded-xl cursor-pointer bg-white
    transition-all duration-300 ease-out
    hover:-translate-y-2 hover:scale-[1.02]
    hover:shadow-2xl
    will-change-transform
  "
                  >
                    {index < 3 && (
                      <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                        #{index + 1} Best Seller
                      </div>
                    )}

                    {/* 👇 Edit button for seller */}
                    {user?.role === "seller" && (
                      <button
                        className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/seller/product/edit/${product._id}`);
                        }}
                      >
                        Edit
                      </button>
                    )}

                    <img
                      src={product.images?.[0]?.url || "/placeholder.png"}
                      className="h-44 w-full object-contain p-3"
                      alt={product.title}
                    />

                    <CardContent className="space-y-2">
                      <p className="font-semibold line-clamp-2 min-h-[40px]">
                        {product.title}
                      </p>

                      <div className="flex items-center gap-2">
                        <Rating
                          value={product.rating || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <span className="text-xs text-gray-500">
                          {product.numReviews || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold text-lg">
                          ₹{product.price}
                        </span>

                        {product.mrp && (
                          <span className="text-gray-500 line-through text-sm">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>

                      {product.mrp && (
                        <p className="text-green-600 text-sm font-medium">
                          Save {discount}%
                        </p>
                      )}

                      <button
                        className="bg-yellow-400 hover:bg-yellow-500 px-3 py-2 rounded w-full font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Add to Cart
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ================= ADMIN SECTION ================= */}
      {activeSection === "pending" && user?.role === "admin" && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Pending Product Approvals</h2>

          {pendingProducts.length === 0 ? (
            <p>No pending products</p>
          ) : (
            pendingProducts.map(product => (
              <div key={product._id} className="border p-3 rounded mb-2">
                {product.title}
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= SELLER SECTION ================= */}
      {activeSection === "products" && user?.role === "seller" && (
        <div className="p-4">
          <h2 className="text-xl font-bold">Seller Products</h2>
        </div>
      )}

      {activeSection === "orders" && (
        <div className="p-4">
          <h2 className="text-xl font-bold">Orders</h2>
        </div>
      )}

      <AIShopAssistant />
    </div>

  );
};

export default HomePage;
