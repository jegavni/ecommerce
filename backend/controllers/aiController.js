  //  HELPER: Call Google Gemini API

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function callOpenAI(prompt, { maxTokens = 800 } = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in .env");
  }

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: prompt,
    max_output_tokens: maxTokens,
  });

  return response.output_text.trim();
}
  //  Gemini sometimes wraps JSON in markdown fences

function extractJSON(text) {
  // Try to extract JSON from markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim());
  }
  // Try direct parse
  return JSON.parse(text);
}

/* =============================================
   1. AI Chat Endpoint (Gemini-powered)
   POST /api/ai/chat
============================================= */
export const aiChat = async (req, res) => {
  try {
    const { message, products } = req.body;

    const productContext = products?.length
      ? `Available products:\n${products
          .slice(0, 8)
          .map((p) => `${p.title} - ₹${p.price}`)
          .join("\n")}`
      : "";

    const prompt = `You are a helpful ecommerce shopping assistant for an Indian online store called EasyShop.
Help the user choose products. Be friendly, concise and practical. All prices are in INR (₹).

${productContext}

User message:
${message}

Reply in a helpful, concise way (maximum 3-4 sentences).`;

    const reply = await callOpenAI(prompt, {
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

/* =============================================
   2. AI Price Comparison Endpoint (Gemini-powered)
   POST /api/ai/compare-price
   Body: { productName, price, category, brand }
============================================= */
export const comparePrice = async (req, res) => {
  try {
    const { productName, price, category, brand } = req.body;

    if (!productName || !price) {
      return res.status(400).json({ message: "productName and price are required" });
    }

    // Build category-aware site list
    const allSites = [
      { name: "Amazon.in",  key: "amazon",   searchUrl: `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`,   logo: "https://logo.clearbit.com/amazon.in",   categories: ["all"] },
      { name: "Flipkart",   key: "flipkart",  searchUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`, logo: "https://logo.clearbit.com/flipkart.com", categories: ["all"] },
      { name: "Meesho",     key: "meesho",    searchUrl: `https://www.meesho.com/search?q=${encodeURIComponent(productName)}`,   logo: "https://logo.clearbit.com/meesho.com",  categories: ["all"] },
      { name: "Snapdeal",   key: "snapdeal",  searchUrl: `https://www.snapdeal.com/search?keyword=${encodeURIComponent(productName)}`, logo: "https://logo.clearbit.com/snapdeal.com", categories: ["all"] },
      { name: "Myntra",     key: "myntra",    searchUrl: `https://www.myntra.com/${encodeURIComponent(productName)}`,              logo: "https://logo.clearbit.com/myntra.com",  categories: ["fashion", "clothing", "apparel", "shoes", "footwear", "accessories", "bags"] },
      { name: "Nykaa",      key: "nykaa",     searchUrl: `https://www.nykaa.com/search/result/?q=${encodeURIComponent(productName)}`, logo: "https://logo.clearbit.com/nykaa.com",   categories: ["beauty", "skincare", "makeup", "health", "wellness", "personal care"] },
      { name: "Croma",      key: "croma",     searchUrl: `https://www.croma.com/searchB?q=${encodeURIComponent(productName)}`,      logo: "https://logo.clearbit.com/croma.com",   categories: ["electronics", "mobile", "laptop", "tv", "appliances", "gadgets"] },
      { name: "Reliance Digital", key: "reliance", searchUrl: `https://www.reliancedigital.in/search?q=${encodeURIComponent(productName)}`, logo: "https://logo.clearbit.com/reliancedigital.in", categories: ["electronics", "mobile", "laptop", "tv", "appliances"] },
    ];

    // Filter sites by category relevance
    const catLower = (category || "").toLowerCase();
    const selectedSites = allSites.filter(site =>
      site.categories.includes("all") ||
      site.categories.some(c => catLower.includes(c))
    );

    const prompt = `You are a smart Indian e-commerce price comparison AI assistant.
Given a product and its current price on a local marketplace, analyze if the price is good, fair, or expensive.
Provide estimated price ranges for the same or similar product on popular Indian shopping sites.
Be concise and practical. All prices in INR (₹).

Product: "${productName}"
Brand: ${brand || "Unknown"}
Category: ${category || "General"}
Current Price: ₹${price}

Analyze the price and respond with ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "verdict": "good_deal" or "fair_price" or "overpriced",
  "verdictLabel": "Great Deal!" or "Fair Price" or "Overpriced",
  "insight": "2-3 sentence AI analysis of the price with specific advice",
  "priceRanges": {
    "amazon": { "min": number, "max": number },
    "flipkart": { "min": number, "max": number },
    "meesho": { "min": number, "max": number },
    "snapdeal": { "min": number, "max": number },
    "myntra": { "min": number, "max": number },
    "nykaa": { "min": number, "max": number },
    "croma": { "min": number, "max": number },
    "reliance": { "min": number, "max": number }
  },
  "bestSite": "amazon" or "flipkart" or "meesho" or "snapdeal" or "myntra" or "nykaa" or "croma" or "reliance",
  "savingsTip": "One actionable tip like 'Check Flipkart during sale season for up to 30% off'"
}`;

const rawText = await callOpenAI(prompt, {
  maxTokens: 600,
});

    let aiData;
    try {
      aiData = extractJSON(rawText);
    } catch {
      aiData = {
        verdict: "fair_price",
        verdictLabel: "Fair Price",
        insight: "This appears to be a reasonably priced product. We recommend comparing on Amazon.in and Flipkart for the best deals.",
        priceRanges: {},
        bestSite: "amazon",
        savingsTip: "Keep an eye out for sale events like Big Billion Day or Great Indian Festival for better prices."
      };
    }

    // Merge AI price ranges into the site list
    const sitesWithPrices = selectedSites.map(site => ({
      ...site,
      estimatedMin: aiData.priceRanges?.[site.key]?.min ?? null,
      estimatedMax: aiData.priceRanges?.[site.key]?.max ?? null,
      isBestDeal: site.key === aiData.bestSite,
    }));

    res.json({
      verdict: aiData.verdict || "fair_price",
      verdictLabel: aiData.verdictLabel || "Fair Price",
      insight: aiData.insight || "",
      savingsTip: aiData.savingsTip || "",
      bestSite: aiData.bestSite || "amazon",
      sites: sitesWithPrices,
      currentPrice: price,
      productName,
    });

  } catch (error) {
    console.error("OpenAI Price Comparison Error:", error.message);
    res.status(500).json({ message: "Price comparison failed. Please try again." });
  }
};

/* =============================================
   3. AI Dynamic Ad Banner Generator (Gemini-powered)
   GET /api/ai/ad-banner?categories=electronics,fashion
============================================= */
// export const getAdBanner = async (req, res) => {
//   try {
//     const categories = req.query.categories
//       ? req.query.categories.split(",").map(c => c.trim()).filter(Boolean)
//       : ["general", "electronics", "fashion"];

//     const topProducts = req.query.products
//       ? req.query.products.split("|").slice(0, 6)
//       : [];

//     const productHint = topProducts.length
//       ? `Top products in store: ${topProducts.join(", ")}.`
//       : "";

//     const prompt = `You are a creative e-commerce marketing AI for an Indian online shopping platform called EasyShop.
// Generate dynamic, exciting, and culturally relevant promotional banner ad content.
// All prices in INR (₹). Be creative, punchy, and use emojis effectively.

// Store categories available: ${categories.join(", ")}.
// ${productHint}

// Generate exactly 3 different promotional banner ads for this store homepage.
// Each ad should target a different category or theme. Make them vivid, exciting and click-worthy.

// Respond with ONLY valid JSON (no markdown fences, no extra text) in this EXACT format:
// {
//   "banners": [
//     {
//       "id": 1,
//       "headline": "Catchy headline (max 8 words)",
//       "subtext": "Compelling description or offer (max 12 words)",
//       "cta": "Call-to-action button text (max 4 words)",
//       "badge": "Optional badge like 'Up to 60% Off' or 'New Arrivals' or 'Flash Deal' (max 4 words)",
//       "emoji": "One relevant emoji",
//       "category": "Target category name",
//       "gradientFrom": "hex color like #1e40af",
//       "gradientTo": "hex color like #3b82f6",
//       "textColor": "hex color for text, ensure readable on gradient (e.g. #ffffff or #1a1a1a)",
//       "accentColor": "hex color for badge/CTA button (e.g. #f59e0b)",
//       "imageQuery": "Descriptive search term for banner image (e.g. 'luxury electronics gadgets')"
//     }
//   ]
// }`;

// const rawText = await callOpenAI(prompt, {
//   maxTokens: 700,
// });
//     let aiData;
//     try {
//       aiData = extractJSON(rawText);
//     } catch {
//       // fallback banners if parsing fails
//       aiData = {
//         banners: [
//           {
//             id: 1,
//             headline: "Shop Smart, Save Big Today!",
//             subtext: "Best deals on top products — limited time offers",
//             cta: "Shop Now",
//             badge: "Up to 50% Off",
//             emoji: "🔥",
//             category: "all",
//             gradientFrom: "#1e40af",
//             gradientTo: "#7c3aed",
//             textColor: "#ffffff",
//             accentColor: "#f59e0b",
//             imageQuery: "shopping deals india",
//           },
//           {
//             id: 2,
//             headline: "New Season, New Styles",
//             subtext: "Trending fashion at unbeatable prices",
//             cta: "Explore Now",
//             badge: "New Arrivals",
//             emoji: "👗",
//             category: "fashion",
//             gradientFrom: "#be185d",
//             gradientTo: "#9333ea",
//             textColor: "#ffffff",
//             accentColor: "#fcd34d",
//             imageQuery: "fashion clothing india",
//           },
//           {
//             id: 3,
//             headline: "Power Up Your Tech Life",
//             subtext: "Latest electronics at incredible prices",
//             cta: "View Deals",
//             badge: "Flash Sale",
//             emoji: "⚡",
//             category: "electronics",
//             gradientFrom: "#065f46",
//             gradientTo: "#0891b2",
//             textColor: "#ffffff",
//             accentColor: "#34d399",
//             imageQuery: "electronics gadgets india",
//           }
//         ]
//       };
//     }

//     // Attach Unsplash image URLs
//     const banners = (aiData.banners || []).map((b, i) => ({
//       ...b,
//       imageUrl: `https://source.unsplash.com/800x400/?${encodeURIComponent(b.imageQuery || "shopping")}&sig=${Date.now() + i}`,
//     }));

//     // Cache hint: re-generate every 30 minutes
//     res.setHeader("Cache-Control", "public, max-age=1800");
//     res.json({ banners });

//   } catch (error) {
//     console.error("OpenAI Ad Banner Error:", error);
//     res.status(500).json({ message: "Failed to generate banners." });
//   }
// };
