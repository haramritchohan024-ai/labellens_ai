const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

// Load additives database
const additivesPath = path.join(__dirname, '../data/additives.json');
let additivesDB = [];

try {
    const data = fs.readFileSync(additivesPath, 'utf8');
    additivesDB = JSON.parse(data);
    console.log("✅ Additives database loaded:", additivesDB.length, "items");
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

    // Match by code
    let match = additivesDB.find(a => normalizeCode(a.code) === normalizedId);

    // Match by name (case-insensitive)
    if (!match) {
        match = additivesDB.find(a =>
            a.name.toLowerCase() === identifier.toLowerCase()
        );
    }

    return match;
};

// Helper: Extract additives using Regex ONLY
const extractWithRegex = (text) => {
    const additives = [];

    // Matches:
    // E100, E 100, E102a
    // INS 100, INS100
    const regex = /(?:E\s?(\d{3,4}[a-z]?)|INS\s?(\d{3,4}[a-z]?))/gi;

    let match;
    while ((match = regex.exec(text)) !== null) {
        const num = match[1] || match[2];
        const code = `E${num}`.toUpperCase();
        additives.push({ code, name: match[0] });
    }

    return additives;
};

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { CATEGORIES, getPrimaryCategories } = require('../constants/categories');
const User = require('../models/User');
const ScanHistory = require('../models/ScanHistory');

// Baseline Defaults
const DEFAULT_PREFS = {
    healthConditions: {},
    dietaryLifestyle: {},
    riskSensitivity: { level: 'moderate' },
    scoringPriority: {
        sugarWeight: 50,
        additiveWeight: 50,
        preservativeWeight: 50,
        allergenWeight: 50
    }
};

// Keyword Mapping for Triggers
const KEYWORD_TRIGGERS = {
    vegan: ['milk', 'whey', 'casein', 'honey', 'gelatin', 'egg', 'carmine'],
    vegetarian: ['gelatin', 'carmine', 'meat', 'chicken', 'beef', 'fish'],
    diabetes: ['sugar', 'syrup', 'fructose', 'glucose', 'maltodextrin', 'dextrose', 'sucrose'],
    childSafe: ['artificial color', 'red 40', 'yellow 5', 'blue 1', 'aspartame', 'sucralose', 'saccharin'],
    glutenIntolerant: ['wheat', 'barley', 'rye', 'malt', 'oat'],
    lactoseIntolerant: ['milk', 'cheese', 'whey', 'butter', 'cream', 'lactose'],
    nutAllergy: ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'macadamia', 'pistachio'],
    soyAllergy: ['soy', 'edamame', 'tofu', 'tempeh', 'miso'],
    eggAllergy: ['egg', 'albumen', 'lysozyme', 'mayonnaise']
};

// Main Controller
const analyzeSafety = async (req, res) => {
    try {
        const { text, overridePrimary, overrideSecondary } = req.body;

        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        console.log("🔎 Analyzing text:", text.substring(0, 50));

        // 1️⃣ Extract using REGEX ONLY
        const extractedAdditives = extractWithRegex(text);

        console.log("Detected Codes:", extractedAdditives);

        const foundAdditives = [];
        const unknownAdditives = [];

        let score = 100;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;

        // 2️⃣ Resolve User Preferences
        let prefs = DEFAULT_PREFS;
        let triggeredPreferences = [];
        let reasoning = [];

        if (req.user) {
            const userDoc = await User.findById(req.user.id).select('preferences').lean();
            if (userDoc && userDoc.preferences) {
                prefs = userDoc.preferences;
            }
        }

        const normText = text.toLowerCase();

        // 3️⃣ Keyword Trigger Detection based on Preferences
        const checkTriggers = (prefCategory, triggersMap) => {
            Object.keys(prefCategory).forEach(key => {
                if (prefCategory[key] && triggersMap[key]) {
                    const foundKeywords = triggersMap[key].filter(kw => normText.includes(kw));
                    if (foundKeywords.length > 0) {
                        triggeredPreferences.push(key);
                        reasoning.push(`Contains ${foundKeywords.join(', ')} which conflicts with your ${key} preference.`);
                    }
                }
            });
        };

        checkTriggers(prefs.dietaryLifestyle || {}, KEYWORD_TRIGGERS);
        checkTriggers(prefs.healthConditions || {}, KEYWORD_TRIGGERS);

        // 4️⃣ Lookup in JSON DB & Count Risks
        for (const item of extractedAdditives) {
            const dbMatch = findAdditive(item.code);

            if (dbMatch) {
                if (!foundAdditives.some(a => a.code === dbMatch.code)) {
                    foundAdditives.push(dbMatch);

                    if (dbMatch.risk === 'High') highCount++;
                    else if (dbMatch.risk === 'Medium') mediumCount++;
                    else if (dbMatch.risk === 'Low') lowCount++;
                }
            } else {
                unknownAdditives.push(item.code);
            }
        }

        console.log("Found in DB:", foundAdditives.length);

        // 5️⃣ Dynamic Scoring Logic using Preferences Weightings
        const additiveWeightMod = (prefs.scoringPriority?.additiveWeight || 50) / 50; // 1.0 is default

        let deductions = 0;
        deductions += (highCount * 30 * additiveWeightMod);
        deductions += (mediumCount * 15 * additiveWeightMod);
        deductions += (lowCount * 5 * additiveWeightMod);

        // Add extreme penalties for triggered health/lifestyle preferences
        if (triggeredPreferences.length > 0) {
            deductions += (triggeredPreferences.length * 25);
        }

        // Apply Risk Sensitivity Global Modifier
        const sensitivity = prefs.riskSensitivity?.level || 'moderate';
        if (sensitivity === 'conservative') {
            deductions *= 1.25;
            if (deductions > 0) reasoning.push("Risk score amplified due to your Conservative sensitivity setting.");
        } else if (sensitivity === 'lenient') {
            deductions *= 0.8;
            if (deductions > 0) reasoning.push("Risk score reduced due to your Lenient sensitivity setting.");
        }

        score -= deductions;

        // Clamp score 0-100
        score = Math.max(0, Math.min(100, Math.round(score)));

        // 4️⃣ Risk Level (Diagnostic Thresholds)
        let riskLevel = "low";
        let summary = "Safe for consumption based on additive analysis.";

        if (score > 70) {
            riskLevel = "high";
            summary = "Contains high-risk additives. Limit consumption.";
        } else if (score > 40) {
            riskLevel = "moderate";
            summary = "Contains some additives to be aware of.";
        }

        // 5️⃣ Hybrid Category Resolution Logic
        let finalPrimary = overridePrimary || "Uncategorized";
        let finalSecondary = overrideSecondary || "Unknown";
        let isAiDetected = false;

        // If user didn't override, we ask AI to classify based strictly on Enums
        if (!overridePrimary && process.env.GEMINI_API_KEY) {
            try {
                console.log("🤖 Generating AI Category Classification Fallback...");
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `
                    Analyze the following ingredients and determine the most appropriate Primary and Secondary food category from the strict lists below.
                    
                    Allowed Primary Categories: ${getPrimaryCategories().join(', ')}
                    
                    Allowed Corresponding Secondary Categories: ${JSON.stringify(CATEGORIES, null, 2)}
                    
                    Respond ONLY with a valid JSON object matching this exact format, with NO Markdown wrapping, quotes or other text:
                    {
                        "primary": "Exact Primary Match",
                        "secondary": "Exact Secondary Match"
                    }
                    
                    Ingredients: ${text.substring(0, 300)}
                `;

                const result = await model.generateContent(prompt);
                const aiText = result.response.text().trim();

                // Strip markdown backticks if AI ignores prompt constraints
                const cleanedJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanedJson);

                // Validate against Enums to prevent hallucinated categories
                if (CATEGORIES[parsed.primary] && CATEGORIES[parsed.primary].includes(parsed.secondary)) {
                    finalPrimary = parsed.primary;
                    finalSecondary = parsed.secondary;
                    isAiDetected = true;
                    console.log(`✅ AI Classified: ${finalPrimary} -> ${finalSecondary}`);
                } else {
                    console.warn(`⚠️ AI generated invalid categories: ${parsed.primary} -> ${parsed.secondary}`);
                }
            } catch (aiErr) {
                console.error("❌ AI Classification failed, falling back to Uncategorized", aiErr);
            }
        }

        // 6️⃣ Fetch Deep DB Alternatives based on Resolved AI Category
        let alternatives = [];
        try {
            if (finalSecondary !== "Unknown") {
                // Fetch up to 6 alternatives that match the exact subcategory.
                // Priority Sort: Lower Risk Score, Clean Label
                alternatives = await Product.find({ subcategory: finalSecondary })
                    .sort({ riskScore: 1, cleanLabel: -1 })
                    .limit(6)
                    .lean();

                // If subcategory has too few, fallback to matching any in Primary Category
                if (alternatives.length < 3 && finalPrimary !== "Uncategorized") {
                    const categoryDocs = await require('../models/Category').findOne({ name: finalPrimary });
                    if (categoryDocs) {
                        const fallbackAlts = await Product.find({
                            category: categoryDocs._id,
                            _id: { $nin: alternatives.map(a => a._id) }
                        })
                            .sort({ riskScore: 1, cleanLabel: -1 })
                            .limit(6 - alternatives.length)
                            .lean();

                        alternatives = [...alternatives, ...fallbackAlts];
                    }
                }
            }
        } catch (altErr) {
            console.error("❌ Failed to resolve Alternatives from Database:", altErr);
        }

        const response = {
            score,
            riskLevel,
            additivesFound: foundAdditives,
            unknownAdditives,
            summary,
            triggeredPreferences,
            reasoning,
            alternatives, // Inject dynamic DB equivalents
            // Return resolved Hybrid Categories
            detectedCategory: {
                primary: finalPrimary,
                secondary: finalSecondary,
                isAiDetected
            }
        };

        // 6️⃣ Auto-Log History for Authenticated Users 
        if (req.user && req.user.id) {
            try {
                const historyEntry = new ScanHistory({
                    userId: req.user.id,
                    category: finalPrimary,
                    detectedAdditives: foundAdditives.map(a => `${a.name} (${a.code})`),
                    riskScore: Math.round(score),
                    riskLevel: riskLevel,
                    summary: summary,
                    rawIngredientsText: text
                });
                await historyEntry.save();
                console.log(`✅ Logged Diagnostic ScanHistory for User: ${req.user.id}`);
            } catch (histErr) {
                console.error("❌ Failed to log ScanHistory mapping:", histErr);
            }
        }

        res.json(response);

    } catch (error) {
        console.error("Safety Analysis Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        });
    }
};

module.exports = { analyzeSafety };