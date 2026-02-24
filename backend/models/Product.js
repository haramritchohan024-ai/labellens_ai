const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String },

    // Relational Deep Category Topology
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: String, required: true, index: true },

    ingredients: [{ type: String }],
    additives: [{ type: String }], // explicit storage of raw string additives array

    // Safety Score (Legacy 0-10) and Risk Score (New AI Engine 0-100)
    safetyRating: { type: Number, min: 0, max: 10, index: true },
    riskScore: { type: Number, required: true, min: 0, max: 100, index: true },
    riskLevel: { type: String, enum: ["low", "moderate", "high"], index: true }, // Normalized to diagnostic string

    // Dynamic Alternative Data
    description: { type: String },
    imageUrl: { type: String }, // dynamic string mapping to unsplash keyword sources
    highlights: [{ type: String }],
    benefits: [{ type: String }],
    dietaryTags: [{ type: String, index: true }], // vegan, gluten-free, organic etc.
    cleanLabel: { type: Boolean, default: false, index: true },

    // Risk Breakdown Metrics
    additiveRisk: { type: Number, min: 0, max: 100, default: 0 },
    sugarRisk: { type: Number, min: 0, max: 100, default: 0 },
    artificialRisk: { type: Number, min: 0, max: 100, default: 0 },

    price: { type: Number },
    priceCategory: { type: String, enum: ["low", "medium", "premium"], index: true },
    imageUrl: { type: String, required: true },
    alternatives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// Prevent Saving Uncategorized specific blanks without strict mapping? We have enum checks inside API route
module.exports = mongoose.model('Product', productSchema);
