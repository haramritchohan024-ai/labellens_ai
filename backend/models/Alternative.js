const mongoose = require('mongoose');

const AlternativeSchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true }, // e.g., "Chips", "Soda"
    alternatives: [{
        name: String,
        whyBetter: String,
        additiveReduction: String,
        cost: String, // ₹, ₹₹, ₹₹₹
        nutrition: String,
        score: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Alternative', AlternativeSchema);
