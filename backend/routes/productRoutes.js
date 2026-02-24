const express = require('express');
const router = express.Router();
const { getProducts, searchAlternatives, getProductIntelligence } = require('../controllers/productController');

// GET /api/products
router.get('/', getProducts);

// POST /api/products/alternatives/search
// Payload expects: { primaryCategory, secondaryCategory, tertiaryCategory, riskScore }
router.post('/alternatives/search', searchAlternatives);

// POST /api/products/:id/intelligence
// Payload expects: { scannedProduct }
router.post('/:id/intelligence', getProductIntelligence);

module.exports = router;
