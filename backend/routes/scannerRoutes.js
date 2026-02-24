const express = require('express');
const router = express.Router();
const { scanProductAndGetAlternatives } = require('../controllers/scannerController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, scanProductAndGetAlternatives);

module.exports = router;
