const express = require('express');
const router = express.Router();
const { getAlternatives } = require('../controllers/alternativeController');

// GET /api/alternatives?category=snack&score=5
router.get('/', getAlternatives);

module.exports = router;
