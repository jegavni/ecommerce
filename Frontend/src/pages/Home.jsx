import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Rating } from "@mui/material";

import Header from "../components/Header";
import { HomeSection } from "../components/HomeSection";
import AIShopAssistant from "../components/AIShopAssistant";

import { Card, CardContent } from "@/components/ui/card";
import { addToCart } from "../Redux/slices/cartSlice";

const HomePage = ({ products = [] }) => {

  const [activeSection, setActiveSection] = useState("home");
  const [pendingProducts, setPendingProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.user);

  /* ================= FETCH RECENTLY VIEWED ================= */

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/recentlyViewed`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(setRecentlyViewed)
      .catch(console.error);
  }, []);

  /* ================= ADMIN PENDING PRODUCTS ================= */

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

  /* ================= ADD TO CART ================= */

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
    <div className="bg-gray-200 min-h-screen">

      {/* HEADER */}
      <Header
        products={products}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* CENTER CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-6 pb-20">

        {activeSection === "home" && (
          <>
            {/* HERO BANNER */}
            <div className="bg-yellow-300 rounded-xl p-8 flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Get set & fly to Dubai
                </h2>
                <p className="text-gray-700">Starting ₹7,599</p>
              </div>

              <img
                src="https://picsum.photos/400/300"
                className="h-24 object-contain"
                alt="banner"
              />
            </div>

            {/* CATEGORY SECTION */}
            <div className="-mt-20 relative z-10 grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-10">

              {user && (
                <HomeSection
                  title="Pick up where you left off"
                  products={recentlyViewed}
                />
              )}

              <HomeSection title="Keep shopping for" />

              {user && (
                <HomeSection
                  title="Recommended for you"
                  products={products}
                />
              )}

              {user && (
                <HomeSection
                  title="Buy again"
                  products={products}
                />
              )}

            </div>

            {/* PRODUCT GRID */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">

              {products.map((product, index) => {

                const discount = product.mrp
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  : 0;

                return (
                  <Card
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="relative bg-white cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition"
                  >

                    {index < 3 && (
                      <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                        #{index + 1} Best Seller
                      </div>
                    )}

                   {(user?.role === "seller" || user?.role === "admin") && (
                      <button
                        className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-3 py-1 rounded"
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
                        <p className="text-green-600 text-sm">
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
          </>
        )}

        {/* ADMIN PANEL */}

        {activeSection === "pending" && user?.role === "admin" && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">
              Pending Product Approvals
            </h2>

            {pendingProducts.length === 0 ? (
              <p>No pending products</p>
            ) : (
              pendingProducts.map(product => (
                <div
                  key={product._id}
                  className="border p-3 rounded mb-2 bg-white"
                >
                  {product.title}
                </div>
              ))
            )}
          </div>
        )}

      </div>

      <AIShopAssistant />
    </div>
  );
};

export default HomePage;