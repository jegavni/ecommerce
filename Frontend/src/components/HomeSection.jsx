import { Card } from "@mui/material";
import { CardContent } from "@/components/ui/card.tsx";
import { useNavigate } from "react-router-dom";

export const HomeSection = ({ title, products = [] }) => {
  const navigate = useNavigate();

  if (!products.length) return null;

  return (
    <Card
      onClick={() => navigate("/recentlyViewed")}
      className="rounded-xl cursor-pointer hover:shadow-md transition"
    >
      <CardContent>
        <p className="font-semibold mb-2">{title}</p>

        <div className="grid grid-cols-2 gap-2">
          {products?.slice(0, 4).map((product, index) => {
            const imageUrl = product?.images?.[0]?.url;

            if (!imageUrl) return null;

            return (
              <img
                key={product.id || product._id || index}
                src={imageUrl}
                alt={product?.title || "product image"}
                className="w-full h-24 object-contain bg-gray-50 border rounded p-1"
              />
            );
          })}

        </div>
        <p    
          onClick={(e) => {
            e.stopPropagation();
            navigate("/recentlyViewed");
          }}
          className="text-blue-600 text-sm mt-2 cursor-pointer"
        >
          See more
        </p>

      </CardContent>
    </Card>
  );
};

