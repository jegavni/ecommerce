import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  TextField,
  Button,
  Pagination,
  Container,
} from "@mui/material";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchProducts = async () => {
    const { data } = await axios.get(
      `http://localhost:5000/api/products?keyword=${keyword}&page=${page}`
    );

    setProducts(data.products);
    setPages(data.pages);
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  return (
    <Container sx={{ mt: 4 }}>
      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search products..."
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      <Button sx={{ mt: 2 }} variant="contained" onClick={fetchProducts}>
        Search
      </Button>

      {/* Products */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {products.map(p => (
          <Grid item xs={12} md={3} key={p._id}>
            {/* ProductCard */}
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Pagination
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
        count={pages}
        page={page}
        onChange={(e, value) => setPage(value)}
      />
    </Container>
  );
};

export default ProductList;
