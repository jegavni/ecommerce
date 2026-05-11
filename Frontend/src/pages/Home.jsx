import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Rating } from "@mui/material";

import { HomeSection } from "../components/HomeSection";
import { logoutUser } from "../Redux/slices/userSlice";
import { Card, CardContent } from "@/components/ui/card";
import { addToCart } from "../Redux/slices/cartSlice";
import HeroBanner from "../components/HeroBanner";


const HomePage = ({ products = [] }) => {

  const [activeSection, setActiveSection] = useState("home");
  const [pendingProducts, setPendingProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.user);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => {
    if (!token || !user) {
      dispatch(logoutUser());
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/recentlyViewed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRecentlyViewed(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          dispatch(logoutUser());
          navigate("/login");
        }
      });

  }, [token]);

  useEffect(() => {
    let interval;

    if (hoveredProduct) {
      const product = products.find(p => p._id === hoveredProduct);

      if (product?.images?.length > 1) {
        interval = setInterval(() => {
          setImageIndex((prev) => (prev + 1) % product.images.length);
        }, 1000); // speed
      }
    }

    return () => clearInterval(interval);
  }, [hoveredProduct, products]);




  /* ================= FETCH RECENTLY VIEWED ================= */




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
    <div className="bg-gray-200 min-h-screen py-6">

      {/* CENTER CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-20">

        {activeSection === "home" && (
          <>
            {/* HERO BANNER — AI-powered dynamic ads */}
            <HeroBanner products={products} />

            {/* CATEGORY SECTION */}
            <div className="mt-4 relative z-10 grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-10">

              {user && recentlyViewed.length > 0 && (
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

              {user && recentlyViewed.length > 0 && (
                <HomeSection
                  title="Buy again"
                  products={recentlyViewed}
                />
              )}

            </div>

            {/* PRODUCT GRID */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

              {products.map((product, index) => {

                const discount = product.mrp
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  : 0;

                return (
                  <Card
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    onMouseEnter={() => {
                      setHoveredProduct(product._id);
                      setImageIndex(0);
                    }}
                    onMouseLeave={() => {
                      setHoveredProduct(null);
                      setImageIndex(0);
                    }}
                    className="relative bg-white cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition"
                  >

                    {index < 3 && (
                      <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                        #{index + 1} Best Seller
                      </div>
                    )}

                    {(user?.role === "admin" ||
                      (user?.role === "seller" && product.seller === user._id)) && (
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
                      src={
                        hoveredProduct === product._id
                          ? product.images?.[imageIndex]?.url
                          : product.images?.[0]?.url
                      }
                      className="h-44 w-full object-contain p-3 transition-all duration-500"
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

    </div>
  );
};

export default HomePage;