
import { GoogleGenAI } from "@google/genai";
import { searchProduct } from "../Services/ShoppingService.js";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


const models = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini Embedding",
];

async function callGemini(prompt, { maxTokens = 800 } = {}) {

  console.log("maxTokens",maxTokens);

  for (const model of models) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 600,
          thinkingConfig: {
            thinkingBudget: 0,
          },
          responseMimeType: "application/json",
        },
      });
      console.log(response, { depth: null });
      console.log(`Using model: ${model}`);
      return response.text.trim();

    } catch (err) {
      if (err.status === 429) {
        console.log(`${model} rate limited. Trying next model...`);
        continue;
      }

      throw err;
    }
  }

  throw new Error("All Gemini models are currently rate limited.");
}
//  Gemini sometimes wraps JSON in markdown fences

function extractJSON(text) {
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON found");
  }

  return JSON.parse(text.substring(start, end + 1));
}


export const aiChat = async (req, res) => {
  try {
    const { message, products } = req.body;

    const productContext = products?.length
      ? `Available products:\n${products
        .slice(0, 8)
        .map((p) => `${p.title} - ₹${p.price}`)
        .join("\n")}`
      : "";

    const prompt = `You are EasyShop's AI Product Expert.

You help users:
- Explain any product and its features.
- Compare products.
- Recommend products based on budget and needs.
- Suggest alternatives.
- Answer questions about specifications, pros and cons, and buying advice.
- When available, use the product list below as additional context.

Be friendly, accurate, and concise.
Limit replies to 3–5 sentences.
All prices are in INR (₹).

${productContext}

User question:
${message}
`;

    const reply = await callGemini(prompt, {
      maxTokens: 200,
    });

    res.json({
      reply: reply || "Sorry, I couldn't respond right now.",
    });
  } catch (error) {
    console.error("OpenAI Chat Error:", error);

    res.status(500).json({
      message: "AI failed",
      error: error.message,
    });
  }
};


export const comparePrice = async (req, res) => {
  try {
    const { productName, price, category, brand } = req.body;

    // Validate request
    if (!productName || !price) {
      return res.status(400).json({
        message: "productName and price are required",
      });
    }

    const currentPrice = Number(price);

    // Get live shopping results
    const shoppingResults = await searchProduct(productName);

    // Keep only products with valid prices
    const validResults = shoppingResults.filter(
      (item) =>
        item.extracted_price &&
        !isNaN(item.extracted_price) &&
        item.extracted_price > 0
    );

    // Extract keywords from product name
    const keywords = productName
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // Filter products that are similar in title and price
    const cleanedResults = validResults.filter((item) => {
      const title = item.title?.toLowerCase() || "";

      const keywordMatches = keywords.filter((word) =>
        title.includes(word)
      ).length;

      return (
        keywordMatches >= Math.ceil(keywords.length / 2) &&
        item.extracted_price >= currentPrice * 0.6 &&
        item.extracted_price <= currentPrice * 1.4
      );
    });

    // No comparable products found
    if (cleanedResults.length === 0) {
      return res.json({
        productName,
        currentPrice,
        verdict: "fair_price",
        verdictLabel: "Fair Price",
        insight: "No comparable products were found online.",
        savingsTip: "Try searching again later.",
        bestSite: "Unknown",
        sites: [],
      });
    }

    // Calculate market prices
    const prices = cleanedResults.map((item) => item.extracted_price);

    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice =
      prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Best offer
    const bestOffer = cleanedResults.reduce((best, item) =>
      item.extracted_price < best.extracted_price ? item : best
    );

    const bestSite = bestOffer.source;

    // Verdict
    let verdict = "";
    let verdictLabel = "";

    const percentage =
      ((currentPrice - lowestPrice) / lowestPrice) * 100;

    if (percentage <= 2) {
      verdict = "good_deal";
      verdictLabel = "Great Deal!";
    } else if (percentage <= 10) {
      verdict = "fair_price";
      verdictLabel = "Fair Price";
    } else {
      verdict = "overpriced";
      verdictLabel = "Overpriced";
    }

    // Competitor data for Gemini
    const competitorData = cleanedResults.slice(0,5).map((item) => ({
      store: item.source,
      title: item.title,
      price: item.extracted_price,
    }));

    const prompt = `You are an Indian e-commerce expert.

Current Product

Name:
${productName}

Brand:
${brand || "Unknown"}

Category:
${category || "Unknown"}

EasyShop Price:
₹${currentPrice}

Lowest Market Price:
₹${lowestPrice}

Highest Market Price:
₹${highestPrice}

Average Market Price:
₹${averagePrice.toFixed(0)}

Best Store:
${bestSite}

Verdict:
${verdict}

Competitor Prices

${JSON.stringify(competitorData, null, 2)}

The verdict has already been determined.

Do NOT change it.

Explain why this verdict is correct.

Respond ONLY JSON

{
  "insight": "",
  "savingsTip": ""
}`;

    // Gemini analysis
    const rawText = await callGemini(prompt, {
      maxTokens: 600,
    });
    console.log(rawText);

    let aiData;

    try {
      aiData = extractJSON(rawText);



    } catch {
      aiData = {
        insight: "Unable to analyze the live prices at the moment.",
        savingsTip:
          "Compare prices during major sale events for better savings.",
      };
    }

    // Format results for frontend
    const sites = cleanedResults.map((item) => ({
      key: item.source
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/\./g, ""),
      name: item.source,
      title: item.title,
      price: item.price,
      extractedPrice: item.extracted_price,
      image: item.thumbnail,
      link: item.product_link,
      isBestDeal:
        item.source?.toLowerCase() === bestSite?.toLowerCase(),
    }));

    // Response
    res.json({
      productName,
      currentPrice,
      lowestPrice,
      highestPrice,
      averagePrice: Number(averagePrice.toFixed(2)),
      verdict,
      verdictLabel,
      insight: aiData.insight,
      savingsTip: aiData.savingsTip,
      bestSite,
      sites,
    });
  } catch (error) {
    console.error("Compare Price Error:", error);

    res.status(500).json({
      message: "Price comparison failed.",
      error: error.message,
    });
  }
};



