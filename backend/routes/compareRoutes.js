const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const router = express.Router();

console.log("[compareRoutes] compareRoutes.js loaded ✅"); // Add this to ensure file is loaded

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

router.post('/summary', async (req, res) => {
  console.log(">> [API] POST /api/compare/summary called with:", req.body);
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
    return res.status(400).json({ message: 'At least 2 product IDs are required for comparison.' });
  }

  for (const id of productIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid product ID format: ${id}` });
    }
  }

  try {
    const products = await Product.find({ '_id': { $in: productIds } }).lean();
    console.log("[POST /summary] Found products:", products.length);

    if (!products || products.length !== productIds.length) {
      const foundIds = products.map(p => p._id.toString());
      const missing = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({ message: `Product(s) not found with ID(s): ${missing.join(', ')}` });
    }

    let prompt = `You are an expert sales consultant at an online store specializing in gaming consoles like PlayStation, Nintendo Switch, accessories, and games.
Your task is to objectively compare the following products for a customer.
Write a comparison summary (around 3-5 sentences) in clear, concise English. The summary should highlight key differences, notable advantages of each product, and suggest which product might suit specific user needs or profiles.
Use only the product information provided below. Do not add external information.
Ensure a professional, friendly, and easy-to-understand tone.

Product Information for Comparison:
`;

    products.forEach((product, index) => {
      prompt += `\n--- Product ${index + 1} ---\n`;
      prompt += `Product Name: ${product.name}\n`;

      const effectivePrice = product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
      prompt += `Price: ${effectivePrice} USD\n`;

      prompt += `Category: ${product.category}\n`;
      if (product.brand) prompt += `Brand: ${product.brand}\n`;
      if (product.condition) prompt += `Condition: ${Array.isArray(product.condition) ? product.condition.join(', ') : product.condition}\n`;
      if (product.display) prompt += `Display: ${Array.isArray(product.display) ? product.display.join(', ') : product.display}\n`;
      if (product.rating) prompt += `Rating: ${product.rating}/5\n`;
      if (product.tags && product.tags.length > 0) prompt += `Tags: ${product.tags.join(', ')}\n`;
    });

    prompt += "\n--- End of Product Information ---\n\nComparison Summary:\n";

    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("\u2705 Gemini response:", JSON.stringify(response.data, null, 2));

    const summary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned.";
    res.json({ summary });

  } catch (error) {
    console.error('\u274C Error in /compare/summary:', error?.response?.data || error.message);
    res.status(500).json({ message: 'An error occurred while generating the comparison summary.' });
  }
});

module.exports = router;
