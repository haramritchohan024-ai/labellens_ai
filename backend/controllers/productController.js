const Product = require('../models/Product');
const { CATEGORY_FALLBACKS } = require('../constants/categories');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchAlternatives = async (req, res) => {
    try {
        // Now expecting the rigorous object from either AI or User Override
        const { primaryCategory, secondaryCategory, tertiaryCategory, riskScore, safetyRating } = req.body;

        if (!primaryCategory || !secondaryCategory) {
            return res.status(400).json({ success: false, error: 'Primary and Secondary categories are required.' });
        }

        const currentRisk = Number(riskScore) || 50; // Fallback to medium risk if unavailable

        let formattedAlts = [];

        // ---------------------------------------------------------
        // LEVEL 1: Exact Secondary Category Match & Strictly Better
        // Example: Ice Cream -> Finding better Ice Cream
        // ---------------------------------------------------------
        let level1Alts = await Product.find({
            secondaryCategory: secondaryCategory,
            riskScore: { $lt: currentRisk }
        })
            .sort({ riskScore: 1 }) // Lowest risk first
            .limit(10)
            .lean();

        // ---------------------------------------------------------
        // LEVEL 2: Exact Primary Category Match (If Level 1 is dry)
        // Example: Ice Cream -> Finding ANY better Dairy & Dairy Alternative
        // But we MUST STILL filter by riskScore to ensure it's actually an upgrade
        // ---------------------------------------------------------
        let level2Alts = [];
        if (level1Alts.length < 3) {
            level2Alts = await Product.find({
                primaryCategory: primaryCategory,
                secondaryCategory: { $ne: secondaryCategory }, // Don't fetch what we just fetched in Level 1
                riskScore: { $lt: currentRisk }
            })
                .sort({ riskScore: 1 })
                .limit(10 - level1Alts.length)
                .lean();
        }

        // ---------------------------------------------------------
        // LEVEL 3: Smart Related Fallback mappings
        // Example: Ice Cream -> Frozen Yogurt, Gelato, Vegan Ice Cream
        // ---------------------------------------------------------
        let level3Alts = [];
        const relatedCategories = CATEGORY_FALLBACKS[secondaryCategory];

        // If we still don't have enough from L1 and L2, pull from explicit related categories
        if (relatedCategories && (level1Alts.length + level2Alts.length < 5)) {
            level3Alts = await Product.find({
                secondaryCategory: { $in: relatedCategories },
                riskScore: { $lt: currentRisk }
            })
                .sort({ riskScore: 1 })
                .limit(5)
                .lean();
        }

        // Combine and dedup
        let merged = [...level1Alts, ...level2Alts, ...level3Alts];

        // Final image validation mapper
        formattedAlts = merged.map(alt => {
            if (!alt.imageUrl || !alt.imageUrl.startsWith('http')) {
                alt.imageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";
            }
            return alt;
        });

        // Dedup by ID just in case
        formattedAlts = formattedAlts.filter((alt, index, self) =>
            index === self.findIndex((t) => t._id.toString() === alt._id.toString())
        );

        res.json({
            success: true,
            filterContext: {
                level1Count: level1Alts.length,
                level2Count: level2Alts.length,
                level3Count: level3Alts.length,
            },
            count: formattedAlts.length,
            alternatives: formattedAlts.slice(0, 10)
        });

    } catch (error) {
        console.error('Alternative Search API Error:', error);
        res.status(500).json({ success: false, error: 'Server error fetching cascading safe alternatives.' });
    }
};

// =========================================================
// NEW: PRODUCT INTELLIGENCE ENDPOINT
// =========================================================
const getProductIntelligence = async (req, res) => {
    try {
        const altProductId = req.params.id;
        const scannedProduct = req.body.scannedProduct; // Detailed payload from frontend context

        if (!altProductId) {
            return res.status(400).json({ success: false, error: 'Alternative Product ID is required.' });
        }

        // 1️⃣ Fetch the specific Alternative Product
        const alternative = await Product.findById(altProductId).lean();

        if (!alternative) {
            return res.status(404).json({ success: false, error: 'Product not found.' });
        }

        // Handle case where scannedProduct context might be thin or missing
        const scannedRisk = scannedProduct ? Number(scannedProduct.score) : 80; // Defaults to high risk if missing

        // 2️⃣ MATHEMATICAL COMPARISON LOGIC
        const riskDifference = scannedRisk - alternative.riskScore;
        const comparison = {
            riskDifference: riskDifference > 0 ? riskDifference : 0,
            isSafer: riskDifference > 0,
            categoryMatch: scannedProduct && scannedProduct.detectedCategory
                ? (scannedProduct.detectedCategory.secondary === alternative.secondaryCategory ? "Exact Match" : "Broader Category Map")
                : "Unknown"
        };

        // 3️⃣ DYNAMIC SAFETY EXPLANATION GENERATOR
        let safetyExplanation = "";

        let introText = `This product represents a ${comparison.isSafer ? 'significant safety upgrade' : 'comparable option'} `;
        introText += `within the ${alternative.secondaryCategory || 'same'} category. `;

        let riskText = comparison.isSafer
            ? `By switching, you immediately reduce your chemical risk profile by ${comparison.riskDifference} points. `
            : `It maintains a similar safety profile to your original selection. `;

        let ingredientText = "";
        if (alternative.additiveRisk === 0 && alternative.artificialRisk === 0) {
            ingredientText = "Notably, this alternative completely removes complex artificial additives and synthetic chemical loads, leveraging a much cleaner, natural baseline.";
        } else if (alternative.sugarRisk < 30) {
            ingredientText = "It also maintains a strictly restrained sugar profile, safeguarding against glycemic spikes.";
        }

        safetyExplanation = `${introText}${riskText}${ingredientText}`;

        // 4️⃣ CONSTRUCT STRUCTURED PAYLOAD
        const payload = {
            success: true,
            product: alternative,
            comparison,
            safetyExplanation,
            riskBreakdown: {
                additiveRisk: alternative.additiveRisk || 0,
                sugarRisk: alternative.sugarRisk || 0,
                artificialRisk: alternative.artificialRisk || 0,
                overallRisk: alternative.riskScore
            },
            compatibility: alternative.dietaryTags || []
        };

        res.json(payload);

    } catch (error) {
        console.error('Product Intelligence API Error:', error);
        res.status(500).json({ success: false, error: 'Server error generating full product intelligence breakdown.' });
    }
};

module.exports = { getProducts, searchAlternatives, getProductIntelligence };
