const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: { type: String, default: "anonymous_user", index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    productName: { type: String, required: true },
    category: { type: String },
    subcategory: { type: String },
    scanId: { type: String },
    status: { type: String, enum: ['Pending', 'Under Review', 'Resolved'], default: 'Pending' },
    complaintText: { type: String, required: true, minlength: 20 },
    reason: { type: String }, // Legacy field
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
