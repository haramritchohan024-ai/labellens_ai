const express = require('express');
const router = express.Router();
const {
    addFavorite,
    removeFavorite,
    getFavorites,
    getScanHistory,
    getReports,
    getDashboardAnalytics,
    getPreferences,
    updatePreferences,
    getScanHistoryDetail
} = require('../controllers/userController');

// Favorites
router.post('/favorites', addFavorite);          // POST requires { productId } in body
router.delete('/favorites/:productId', removeFavorite);
router.get('/favorites', getFavorites);

// Scan History
router.get('/history', getScanHistory);
router.get('/history/:id', getScanHistoryDetail);

// Reports
router.get('/reports', getReports);

// Dashboard
router.get('/dashboard/analytics', getDashboardAnalytics);

// Preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

module.exports = router;
