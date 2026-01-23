import "bootstrap/dist/css/bootstrap.min.css";

const Products = ({ products, addToCart }) => {
  return (
    <div className="row">
      {products.length === 0 && (
        <p className="text-center">No products found</p>
      )}

      {products.map(product => (
        <div className="col-md-3 mb-4" key={product._id}>
          <div className="card h-100 shadow-sm">
            <img
              src={`http://localhost:5000/${product.image}`}
              className="card-img-top p-2"
              alt={product.title}
              style={{ height: "180px", objectFit: "contain" }}
            />

            <div className="card-body d-flex flex-column">
              <h6 className="mb-2">{product.title}</h6>
              <p className="text-success fw-bold mb-3">₹{product.price}</p>

              <button
                className="btn btn-warning mt-auto"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Products;
