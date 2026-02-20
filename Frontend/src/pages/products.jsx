import { Card, CardContent } from "@/components/ui/card";
import Rating from "@mui/material/Rating";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const Products = ({ products, addToCart }) => {
  if (!products.length) {
    return <p className="text-center text-muted-foreground">No products found</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => {
        const discount =
          product.mrp && product.price
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : 0;

        return (
          <Card
            key={product._id}
            className="rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <CardContent className="p-3 flex flex-col h-full">

              {/* IMAGE */}
              <div className="h-40 flex items-center justify-center mb-3">
                <img
                  src={`http://localhost:5000/${product.image}`}
                  alt={product.title}
                  className="max-h-full object-contain"
                />
              </div>

              {/* TITLE */}
              <p className="text-sm font-medium line-clamp-2 mb-1">
                {product.title}
              </p>

              {/* RATING */}
              <div className="flex items-center gap-2 mb-1">
                <Rating
                  value={product.rating || 4}
                  precision={0.5}
                  size="small"
                  readOnly
                />
                <span className="text-xs text-muted-foreground">
                  ({product.numReviews || 0})
                </span>
              </div>

              {/* PRICE */}
              <div className="mb-2">
                <span className="text-lg font-bold text-green-600">
                  ₹{product.price}
                </span>

                {product.mrp && (
                  <>
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      ₹{product.mrp}
                    </span>

                    <span className="text-sm text-red-500 font-semibold ml-2">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* DEAL TAG */}
              {discount >= 30 && (
                <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                  <LocalOfferIcon sx={{ fontSize: 16 }} />
                  Limited time deal
                </div>
              )}

              {/* BUTTON */}
              <button
                onClick={() => addToCart(product)}
                className="mt-auto bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg py-2 transition"
              >
                Add to Cart
              </button>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Products;
