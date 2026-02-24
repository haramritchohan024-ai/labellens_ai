const Favorite = require('../models/Favorite');
const ScanHistory = require('../models/ScanHistory');
const Report = require('../models/Report');
const Product = require('../models/Product');

// ==========================================
// FAVORITES
// ==========================================

// Add Favorite
const addFavorite = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'anonymous_user';
        const { productId } = req.body;
        const exists = await Favorite.findOne({ productId, userId });
        if (exists) return res.status(400).json({ success: false, message: 'Already in favorites' });

        const favorite = new Favorite({ productId, userId });
        await favorite.save();
        res.json({ success: true, favorite });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Remove Favorite
const removeFavorite = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'anonymous_user';
        const { productId } = req.params;
        await Favorite.findOneAndDelete({ productId, userId });
        res.json({ success: true, message: 'Favorite removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get Favorites
const getFavorites = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'anonymous_user';
        const favorites = await Favorite.find({ userId }).populate('productId').sort({ savedAt: -1 }).lean();
        // Flatten out the product object so it plays nice with frontend maps
        const products = favorites.map(f => f.productId).filter(p => p != null);
        res.json({ success: true, favorites: products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// SCAN HISTORY
// ==========================================

// Handled directly inside safetyController.js now

// Get History
const getScanHistory = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'anonymous_user';
        const history = await ScanHistory.find({ userId }).sort({ scannedAt: -1 }).lean();

        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get Single History Target
const getScanHistoryDetail = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'anonymous_user';
        const { id } = req.params;

        const historyItem = await ScanHistory.findOne({ _id: id, userId }).lean();

        if (!historyItem) {
            return res.status(404).json({ success: false, message: 'Scan history not found' });
        }

        res.json({ success: true, history: historyItem });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// REPORTS
// ==========================================

const getReports = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'anonymous_user';
        // Mock fetching them
        const reports = await Report.find({ userId }).populate('productId').sort({ createdAt: -1 }).lean();
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// DASHBOARD ANALYTICS ENGINE
// ==========================================

const getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 'anonymous_user';
        // 1. Total Scans (User Scoped)
        const totalScans = await ScanHistory.countDocuments({ userId });

        // 2. Saved Favorites (User Scoped)
        const savedFavorites = await Favorite.countDocuments({ userId });

        // 3. Average Risk Score (User Scoped)
        const aggregations = await ScanHistory.aggregate([
            { $match: { userId } },
            { $group: { _id: null, avgRisk: { $avg: '$riskScore' }, highRiskCount: { $sum: { $cond: [{ $gte: ['$riskScore', 70] }, 1, 0] } } } }
        ]);

        const avgRisk = aggregations.length > 0 ? Math.round(aggregations[0].avgRisk) : 0;
        const highRiskCount = aggregations.length > 0 ? aggregations[0].highRiskCount : 0;

        // 4. Products Under Review
        const underReviewCount = await Report.countDocuments({ userId, status: { $in: ['Pending', 'Under Review'] } });

        // 5. Recent Activity
        const recentScans = await ScanHistory.find({ userId }).sort({ scannedAt: -1 }).limit(5).lean();
        const recentFavorites = await Favorite.find({ userId }).populate('productId').sort({ savedAt: -1 }).limit(3).lean();

        // Formatting
        const formattedFavorites = recentFavorites.map(f => f.productId).filter(p => p != null);

        res.json({
            success: true,
            analytics: {
                totalScans,
                savedFavorites,
                avgRisk,
                highRiskCount,
                underReviewCount
            },
            recentActivity: {
                scans: recentScans,
                favorites: formattedFavorites
            }
        });
    } catch (err) {
        console.error("Dashboard Analytics Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// PREFERENCES ENGINE
// ==========================================

const getPreferences = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const user = await require('../models/User').findById(req.user.id).select('preferences');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, preferences: user.preferences });
    } catch (err) {
        console.error("Get Preferences Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const updatePreferences = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const { preferences } = req.body;

        // Use dot notation or deep merge in production, but here we can just update the whole object
        const updatedUser = await require('../models/User').findByIdAndUpdate(
            req.user.id,
            { $set: { preferences } },
            { new: true, runValidators: true }
        ).select('preferences');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, preferences: updatedUser.preferences });
    } catch (err) {
        console.error("Update Preferences Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    getScanHistory,
    getReports,
    getDashboardAnalytics,
    getPreferences,
    updatePreferences,
    getScanHistoryDetail
};
