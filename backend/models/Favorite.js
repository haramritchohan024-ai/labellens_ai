const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: { type: String, default: "anonymous_user", index: true }, // Placeholder for future auth
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    savedAt: { type: Date, default: Date.now }
});

// Ensure a user can only favorite a product once
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
