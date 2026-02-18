const mongoose = require('mongoose');

const ScanResultSchema = new mongoose.Schema({
    userId: { type: String }, // Optional, for future use
    uploadedImagePath: { type: String },
    extractedText: { type: String },
    detectedAdditives: [{
        code: String,
        name: String,
        riskLevel: String,
        category: String,
        whyUsed: String
    }],
    safetyScore: { type: Number },
    scoreBreakdown: {
        additiveCountPenalty: Number,
        highRiskPenalty: Number,
        moderateRiskPenalty: Number,
        sugarPenalty: Number,
        sodiumPenalty: Number,
        transFatPenalty: Number,
        bonusNoColors: Number,
        bonusNoPreservatives: Number
    },
    nutritionFlags: {
        highSugar: Boolean,
        highSodium: Boolean,
        highSaturatedFat: Boolean,
        transFatPresent: Boolean
    },
    warningsForUser: [String],
    frequencyRecommendation: String,
    alternatives: [{
        name: String,
        whyBetter: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanResult', ScanResultSchema);
