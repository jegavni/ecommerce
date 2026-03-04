import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, products } = req.body;

    const productContext = products?.length
      ? `Available products:\n${products
          .slice(0, 8)
          .map(p => `${p.title} - ₹${p.price}`)
          .join("\n")}`
      : "";

    const prompt = `
You are an ecommerce shopping assistant.
Help the user choose products.

User message: ${message}

${productContext}
`;

    const response = await axios.post(
      "https://router.huggingface.co/models/bigscience/bloomz-560m",
      {
        inputs: prompt,
        parameters: { max_new_tokens: 120 }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data?.[0]?.generated_text ||
      "Sorry, I couldn't respond.";

    res.json({ reply });

  } catch (error) {
    console.error("HF AI error:", error.response?.data || error.message);
    res.status(500).json({ message: "AI failed" });
  }
});

export default router;