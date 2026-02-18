const mongoose = require('mongoose');

const AdditiveSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // E.g., "E300", "INS 300"
    name: { type: String, required: true },
    category: { type: String }, // Preservative, Color, etc.
    typicalUse: { type: String },
    safetyStatus: { type: String, enum: ['Permitted', 'Restricted', 'Controversial', 'Banned', 'Unknown'], default: 'Unknown' },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    synonyms: { type: [String], default: [] }, // Array of alternate names e.g. ["MSG", "Chinese Salt"]
    regulatoryStatus: { type: String, default: "Permitted" },
    penaltyWeight: { type: Number, default: 0 }, // Custom weight for scoring if needed
    groupWarnings: { type: Map, of: String, default: {} }, // Key: tag (e.g. "BP"), Value: Warning message
    description: { type: String } // Renamed from notes or serving as description
}, { timestamps: true });

module.exports = mongoose.model('Additive', AdditiveSchema);
