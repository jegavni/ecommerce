import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RecentlyViewedPage = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const { user, checkingAuth } = useSelector((state) => state.user);

  useEffect(() => {
    //  Wait until auth check completes
    if (checkingAuth) return;

    //  If not logged in → don't call API
    if (!user) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/recentlyViewed`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          return []; //  prevent crash
        }
        return res.json();
      })
      .then((data) => setItems(data || []))
      .catch(console.error);
  }, [user, checkingAuth]);

  //  While checking auth → don't render
  if (checkingAuth) return null;

  //  If not logged in → hide page completely
  if (!user) return null;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Recently Viewed</h1>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {items.map((view) => {
          const product = view.product;

          return (
            <div
              key={view._id}
              onClick={() => navigate(`/product/${product._id}`)}
              className="bg-white rounded-xl p-3 shadow cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.title}
                className="h-40 w-full object-contain mb-2"
              />

              <p className="font-semibold">{product.title}</p>
              <p className="text-green-600 font-bold">₹{product.price}</p>
              <p className="text-xs text-gray-500">
                Viewed {new Date(view.viewedAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyViewedPage;