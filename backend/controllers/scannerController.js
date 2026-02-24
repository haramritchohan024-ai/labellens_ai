const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// Load additives database
const additivesPath = path.join(__dirname, '../data/additives.json');
let additivesDB = [];

try {
    const data = fs.readFileSync(additivesPath, 'utf8');
    additivesDB = JSON.parse(data);
} catch (err) {
    console.error("❌ Error loading additives database:", err);
}

// Helper: Normalize extracted codes
const normalizeCode = (code) => {
    return code.trim().toUpperCase().replace(/\s+/g, '');
};

// Helper: Find additive in DB
const findAdditive = (identifier) => {
    const normalizedId = normalizeCode(identifier);
    let match = additivesDB.find(a => normalizeCode(a.code) === normalizedId);
    if (!match) {
        match = additivesDB.find(a => a.name.toLowerCase() === identifier.toLowerCase());
    }
    return match;
};

// Helper: Extract additives using Regex ONLY
const extractWithRegex = (text) => {
    const additives = [];
    const regex = /(?:E\s?(\d{3,4}[a-z]?)|INS\s?(\d{3,4}[a-z]?))/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const num = match[1] || match[2];
        const code = `E${num}`.toUpperCase();
        additives.push({ code, name: match[0] });
    }
    return additives;
};

const calculateInitialRisk = (text) => {
    if (!text) return { score: 100, riskLevel: "unknown" };

    const extractedAdditives = extractWithRegex(text);
    const foundAdditives = [];
    let score = 100;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const item of extractedAdditives) {
        const dbMatch = findAdditive(item.code);
        if (dbMatch) {
            if (!foundAdditives.some(a => a.code === dbMatch.code)) {
                foundAdditives.push(dbMatch);
                if (dbMatch.risk === 'High') highCount++;
                else if (dbMatch.risk === 'Medium') mediumCount++;
                else if (dbMatch.risk === 'Low') lowCount++;
            }
        }
    }

    let deductions = 0;
    deductions += (highCount * 30);
    deductions += (mediumCount * 15);
    deductions += (lowCount * 5);

    score -= deductions;
    score = Math.max(0, Math.min(100, Math.round(score)));

    let riskLevel = "low";
    if (score < 40) {
        riskLevel = "high";
    } else if (score < 70) {
        riskLevel = "moderate";
    }

    return { score, riskLevel };
};

// Generative AI Image Fallback
const generateFallbackImage = async (productName, brand) => {
    const queryName = `${brand ? brand + ' ' : ''}${productName}`;
    if (process.env.OPENAI_API_KEY) {
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            console.log(`🎨 Generating AI Image for missing product: ${queryName}`);
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: `A highly realistic, professional e-commerce product photography shot of the packaging for a food product named "${queryName}". Clean white background, perfect studio lighting.`,
                n: 1,
                size: "1024x1024",
            });
            return response.data[0].url;
        } catch (e) {
            console.error("❌ DALL-E image generation failed, using placeholder:", e.message);
        }
    }
    // Static Fallback if AI fails or missing key
    return `https://dummyimage.com/600x600/ffffff/000000.png&text=${encodeURIComponent(queryName)}`;
};

const scanProductAndGetAlternatives = async (req, res) => {
    try {
        const { scannedProduct, ingredientsText, scrapedData } = req.body;

        if (!scannedProduct || !scannedProduct.product_name) {
            return res.status(400).json({ error: "scannedProduct with product_name is required." });
        }
        if (!ingredientsText) {
            return res.status(400).json({ error: "ingredientsText is required." });
        }
        if (!scrapedData || !Array.isArray(scrapedData)) {
            return res.status(400).json({ error: "A valid scrapedData array is required." });
        }

        // STEP 1: Calculate Risk Score strictly from LabelLens DB
        const { score, riskLevel } = calculateInitialRisk(ingredientsText);
        console.log(`🔍 Scanning Product: ${scannedProduct.product_name}, Calculated Risk: ${riskLevel} (${score})`);

        scannedProduct.risk_score = riskLevel;

        // Ensure Scanned Product has an image
        if (!scannedProduct.image_url || scannedProduct.image_url.trim() === "") {
            scannedProduct.image_url = await generateFallbackImage(scannedProduct.product_name, scannedProduct.brand);
        }

        // STEP 2 & 3: Filter alternatives to Low/Moderate and handle missing images
        let safeAlternatives = [];

        for (const alt of scrapedData) {
            // Inherit the risk_score directly from scraper if provided
            // Or calculate it from ingredients if provided by scraper
            let altRisk = "moderate"; // Default fallback if data is missing

            // Prefer strictly calculated risk_score if scraper gave us its ingredients
            if (alt.ingredientsText) {
                altRisk = calculateInitialRisk(alt.ingredientsText).riskLevel;
            } else if (alt.risk_score) {
                // If the scraper already attached it (from previous stages or DB mapping)
                altRisk = alt.risk_score.toLowerCase();
            }

            alt.risk_score = altRisk;

            // Only include Safer Alternatives (Low or Moderate)
            if (altRisk === "low" || altRisk === "moderate") {
                // Generative AI Image Fallback
                if (!alt.image_url || alt.image_url.trim() === "") {
                    alt.image_url = await generateFallbackImage(alt.product_name, alt.brand);
                }

                safeAlternatives.push(alt);
            }
        }

        // STEP 4: Format through Gemini strictly for JSON Schema Output consistency
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY missing from environment.", missing_key: true });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are an AI assistant for LabelLens AI. 
            
            We have already fully processed the data. Your ONLY job is to format the provided JSON precisely to the required schema.
            
            Here is the Scanned Product:
            ${JSON.stringify(scannedProduct, null, 2)}
            
            Here are the Safer Alternatives:
            ${JSON.stringify(safeAlternatives, null, 2)}
            
            CRITICAL RULES:
            1. Format the provided data into the structured JSON schema for LabelLens AI.
            2. Do not invent product names, prices, brands, images or other data — strictly use the data provided above.
            3. Keep the risk_score exactly as provided ("${riskLevel}" for the scanned product, and retain the exact risk_scores from the alternatives). Do not let AI guess or recalculate.
            4. Return JSON ready for frontend display.

            Return a strictly valid JSON response matching this EXACT schema ONLY (no markdown backticks, no extra text):
            {
              "product_name": "string",
              "brand": "string",
              "risk_score": "string",
              "source_platform": "string",
              "price": "string",
              "image_url": "string",
              "purchase_link": "string",
              "alternatives": [
                {
                  "product_name": "string",
                  "brand": "string",
                  "risk_score": "string",
                  "source_platform": "string",
                  "price": "string",
                  "image_url": "string",
                  "purchase_link": "string"
                }
              ]
            }
        `;

        const result = await model.generateContent(prompt);
        let aiText = result.response.text().trim();

        // Strip markdown backticks if AI ignores prompt constraints
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(aiText);
        } catch (e) {
            const match = aiText.match(/\{[\s\S]*\}/);
            if (match) {
                parsedData = JSON.parse(match[0]);
            } else {
                throw new Error("Invalid format from AI");
            }
        }

        res.json({
            success: true,
            data: parsedData
        });

    } catch (error) {
        console.error("Scanner API Error:", error);
        res.status(500).json({ error: "Failed to scan product and format JSON", details: error.message });
    }
};

module.exports = { scanProductAndGetAlternatives };
