import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../Redux/slices/cartSlice";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card.tsx";

const SearchPage = ({ products = [] }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const query = params.get("q") || "";

  const [sort, setSort] = useState("default");
  const [maxPrice, setMaxPrice] = useState("");

  const results = useMemo(() => {
    let filtered = products.filter((p) =>
      p.title?.toLowerCase().includes(query.toLowerCase())
    );

    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }, [query, products, sort, maxPrice]);

  const handleAddToCart = (product) => {
    if (!user) {
      toast.info("Please login first");
      navigate("/login");
      return;
    }
    dispatch(addToCart(product));
    toast.success("Added to cart");
  };

  const highlightText = (text) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-green-200">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Results for "{query}"
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

      {results.length === 0 ? (
        <div className="text-yellow-500 text-center mt-10">
          No products found 😔
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <Card
              key={product._id}
              
              className="rounded-xl  cursor-pointer hover:shadow-lg transition bg-white"
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
