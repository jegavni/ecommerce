import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { Home, User, Wallet, ShoppingCart, Bot } from "lucide-react";
import ProductReviewCard from "../components/productReviewCard";

import { addToCart } from "../Redux/slices/cartSlice";
import { logout as logoutUser } from "../Redux/slices/userSlice";

const HomePage = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [pendingProducts, setPendingProducts] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: cart } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.user);
  const fetchPendingProducts = () => {
    axios
      .get("http://localhost:5000/api/admin/products/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setPendingProducts(res.data))
      .catch(console.error);
  };

  // Fetch products
  useEffect(() => {
    axios.get("http://localhost:5000/api/products").then((res) => {
      setProducts(res.data.products || []);
    });
  }, []);

  useEffect(() => {
    if (activeSection === "you" && user?.role === "admin") {
      fetchPendingProducts();
    }
  }, [activeSection, user]);



  // Hide header on scroll down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleAddToCart = (product) => {
    if (!user) {
      toast.info("Please login first");
      navigate("/login");
      return;
    }
    dispatch(addToCart(product));
    toast.success("Added to cart");
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-20">
      {/* TOP SEARCH BAR */}
      <div
        className={`bg-[#131921] p-2 sticky top-0 z-50 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <Input
          placeholder="Search products or help"
          className="bg-white w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* PRODUCTS */}
      {activeSection === "home" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
          {filteredProducts.map((product) => {
            const isSellerOwner =
              user?.role === "seller" &&
              (product.seller === user?._id ||
                product.seller?._id === user?._id);
            console.log("img url 👉", product.images?.[0]);

            return (
              <Card
                key={product._id}
                className="rounded-xl cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/product/${product._id}`)}

              >

                <img
                  src={product.images?.[0]?.url || "/placeholder.png"}
                  className="h-40 w-full object-contain p-2"
                  alt={product.title}
                />


                <CardContent className="space-y-1">
                  <p className="font-semibold truncate">{product.title}</p>
                  <p className="text-green-600 font-bold">₹{product.price}</p>

                  {/* ADD TO CART */}
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    Add to Cart
                  </Button>

                  {/* ✅ EDIT BUTTON – ONLY FOR SELLER & OWNER */}
                  {isSellerOwner && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/seller/product/edit/${product._id}`);
                      }}
                    >
                      Edit Product
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}

        </div>
      )}

      {activeSection === "you" && (
        <div className="p-4 space-y-4">
          <Card className="rounded-xl">
            <CardContent className="space-y-3">
              <h2 className="text-lg font-bold">Your Account</h2>

              {user ? (
                <>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>

                  {/* SELLER / CUSTOMER */}
                  {user.role === "seller" ? (
                    <Button className="w-full" onClick={() => navigate("/addproduct")}>
                      Add Products
                    </Button>
                  ) : user.role !== "admin" ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate("/become-seller")}
                    >
                      Become a Seller
                    </Button>
                  ) : null}

                  {/* ADMIN: PENDING APPROVALS */}
                  {user.role === "admin" && (
                    <div className="space-y-3 pt-4">
                      <h3 className="font-semibold text-orange-600">
                        Pending Approvals
                      </h3>

                      {pendingProducts.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No pending products 🎉
                        </p>
                      ) : (
                        pendingProducts.map((product) => (
                          <ProductReviewCard
                            key={product._id}
                            product={product}
                            onAction={fetchPendingProducts}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {/* ORDERS */}
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => navigate("/orders")}
                  >
                    Recent Orders
                  </Button>

                  {/* LOGOUT */}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      dispatch(logoutUser());
                      navigate("/login");
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button className="w-full" onClick={() => navigate("/login")}>
                  Login
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}



      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
        <NavItem
          icon={<Home />}
          label="Home"
          active={activeSection === "home"}
          onClick={() => setActiveSection("home")}
        />
        <NavItem
          icon={<User />}
          label="You"
          active={activeSection === "you"}
          onClick={() => setActiveSection("you")}
        />
        <NavItem icon={<Wallet />} label="Wallet" onClick={() => navigate("/wallet")} />
        <NavItem
          icon={<ShoppingCart />}
          label={`Cart (${cart.length})`}
          onClick={() => navigate("/cart")}
        />
        <NavItem icon={<Bot />} label="Rufus" />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center text-xs ${active ? "text-orange-500" : "text-gray-600"
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default HomePage;
