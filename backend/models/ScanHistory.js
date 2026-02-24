const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
    userId: { type: String, default: "anonymous_user", index: true },
    category: { type: String, required: true },
    detectedAdditives: [{ type: String }],
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ['low', 'moderate', 'high'], required: true },
    summary: { type: String },
    rawIngredientsText: { type: String },
    scannedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
