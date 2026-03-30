import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../Redux/slices/cartSlice";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card.tsx";
import API from "../api/axios";

const SearchPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const keyword = params.get("keyword") || "";
  const category = params.get("category") || "all";

  const [results, setResults] = useState([]);
  const [sort, setSort] = useState("default");
  const [maxPrice, setMaxPrice] = useState("");

  /*  FETCH FROM BACKEND */
  useEffect(() => {
    const fetchSearch = async () => {
      try {
        const res = await API.get(
          `/api/products?keyword=${keyword}&category=${category}`
        );

        let data = res.data.products || [];

        //  Price filter
        if (maxPrice) {
          data = data.filter((p) => p.price <= Number(maxPrice));
        }

        //  Sorting
        if (sort === "low") data.sort((a, b) => a.price - b.price);
        if (sort === "high") data.sort((a, b) => b.price - a.price);

        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
    };

    fetchSearch();
  }, [keyword, category, sort, maxPrice]);

  /*  ADD TO CART */
  const handleAddToCart = (product) => {
    if (!user) {
      toast.info("Please login first");
      navigate("/login");
      return;
    }
    dispatch(addToCart(product));
    toast.success("Added to cart");
  };

  /*  HIGHLIGHT TEXT */
  const highlightText = (text) => {
    if (!keyword.trim()) return text;

    const parts = text.split(new RegExp(`(${keyword})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="bg-green-200">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Results for "{keyword}"{" "}
        {category !== "all" && `in ${category}`}
      </h2>

      {/* FILTER BAR */}
      <div className="flex gap-3 mb-4">
        <select
          className="border p-2 rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Sort</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </select>

        <input
          type="number"
          placeholder="Max price"
          className="border p-2 rounded"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* RESULTS */}
      {results.length === 0 ? (
        <div className="text-yellow-500 text-center mt-10">
          No products found 
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <Card
              key={product._id}
              className="rounded-xl cursor-pointer hover:shadow-lg transition bg-white"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                className="h-44 w-full object-contain p-3"
                alt={product.title}
              />

              <CardContent>
                <p className="font-semibold truncate">
                  {highlightText(product.title)}
                </p>

                <p className="text-green-600 font-bold">
                  ₹{product.price}
                </p>

                <button
                  className="bg-yellow-400 px-3 py-1 rounded mt-2 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  Add to Cart
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;