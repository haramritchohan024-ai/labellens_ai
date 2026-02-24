const Product = require('../models/Product');

const priceOrder = {
    low: 1,
    medium: 2,
    premium: 3,
    ultra: 4
};

const getAlternatives = async (req, res) => {
    try {
        const { category, score } = req.query;

        if (!category || !score) {
            return res.status(400).json({ success: false, error: 'Category and score are required parameters.' });
        }

        const scannedScore = Number(score);
        if (isNaN(scannedScore)) {
            return res.status(400).json({ success: false, error: 'Score must be a number.' });
        }

        // Rules: 
        // - same category
        // - strictly higher safetyScore than scanned score
        // - Exception: If scannedScore >= 9, only show 10s
        let minScoreRequired = scannedScore + 0.1;
        if (scannedScore >= 9) {
            minScoreRequired = 10;
        }

        let alternatives = await Product.find({
            category: category.toLowerCase(),
            safetyScore: { $gte: minScoreRequired }
        }).lean();

        // If we have none that are strictly better, maybe the user scanned the best item
        if (alternatives.length === 0) {
            // Check if the current scanned item is already the safest in category
            const topInCategory = await Product.find({ category: category.toLowerCase() })
                .sort({ safetyScore: -1 })
                .limit(1)
                .lean();

            if (topInCategory.length > 0 && scannedScore >= topInCategory[0].safetyScore) {
                return res.json({
                    success: true,
                    scannedScore,
                    count: 0,
                    message: "This product is already among the safest in its category.",
                    alternatives: []
                });
            }

            // If we simply don't have enough data but it's not the best, just fetch top 3 safest
            alternatives = await Product.find({ category: category.toLowerCase() })
                .sort({ safetyScore: -1 })
                .limit(3)
                .lean();
        }

        // Sort by safetyScore descending, then priceTier ascending
        alternatives.sort((a, b) => {
            if (b.safetyScore !== a.safetyScore) {
                return b.safetyScore - a.safetyScore; // higher score first
            }
            const priceA = priceOrder[a.priceTier] || 5;
            const priceB = priceOrder[b.priceTier] || 5;
            return priceA - priceB; // cheaper first
        });

        // Limit to exactly 10
        alternatives = alternatives.slice(0, 10);

        // If we have less than 3, fallback to getting top 3 safest in that category 
        // (Only if our strict filtering returned some but fewer than 3, and we want to ensure 3 min if possible)
        if (alternatives.length > 0 && alternatives.length < 3) {
            const top3 = await Product.find({ category: category.toLowerCase() })
                .sort({ safetyScore: -1 })
                .limit(3)
                .lean();

            // Merge unique
            const merged = [...alternatives];
            top3.forEach(p => {
                if (!merged.find(m => m._id.toString() === p._id.toString())) {
                    merged.push(p);
                }
            });

            // re-sort and limit to 10
            merged.sort((a, b) => {
                if (b.safetyScore !== a.safetyScore) return b.safetyScore - a.safetyScore;
                const priceA = priceOrder[a.priceTier] || 5;
                const priceB = priceOrder[b.priceTier] || 5;
                return priceA - priceB;
            });
            alternatives = merged.slice(0, 10);
        }

        res.json({
            success: true,
            scannedScore,
            count: alternatives.length,
            alternatives: alternatives.map(a => ({
                name: a.name,
                brand: a.brand,
                safetyScore: a.safetyScore,
                riskLevel: a.riskLevel,
                priceTier: a.priceTier,
                priceEstimate: a.priceEstimate,
                imageUrl: a.imageUrl,
                shortDescription: a.shortDescription
            }))
        });

    } catch (error) {
        console.error('Alternative API Error:', error);
        res.status(500).json({ success: false, error: 'Server error fetching safe alternatives.' });
    }
};

module.exports = { getAlternatives };
