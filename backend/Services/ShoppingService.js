import axios from "axios";

export const searchProduct = async (productName) => {
  const response = await axios.get(
    "https://serpapi.com/search.json",
    {
      params: {
        engine: "google_shopping",
        q: productName,
        gl: "in",
        hl: "en",
        api_key: process.env.SERPAPI_KEY,
      },
    }

  );
  console.log(response.data.shopping_results[0]);


  return response.data.shopping_results || [];
};