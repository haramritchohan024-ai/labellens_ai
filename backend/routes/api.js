const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromImage } = require('../services/ocrService');
const { analyzeProduct } = require('../services/analysisService');
const ScanResult = require('../models/ScanResult');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// OCR Endpoint
router.post('/ocr', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        const { extractedText, confidence } = await extractTextFromImage(req.file.path);
        // Clean up file if needed, or keep for history
        // fs.unlinkSync(req.file.path); 
        res.json({ extractedText, confidence, imagePath: req.file.path });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'OCR failed: ' + error.message });
    }
});

// Analysis Endpoint
router.post('/analyze', async (req, res) => {
    const { ingredientsText, nutritionText, healthProfile, sensitivityProfile, debugMode } = req.body;

    console.log(`Analyzing Product. Text Length: ${ingredientsText ? ingredientsText.length : 0}`);
    if (debugMode) console.log("Debug Mode Enabled");

    try {
        const fullText = (ingredientsText || "") + " " + (nutritionText || "");
        const analysis = await analyzeProduct(fullText, healthProfile, sensitivityProfile, debugMode);
        res.json(analysis);
    } catch (error) {
        console.error("Analysis Endpoint Error:", error);
        res.status(500).json({ error: 'Analysis failed: ' + error.message });
    }
});

// History Endpoints
router.get('/history', async (req, res) => {
    try {
        const history = await ScanResult.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

router.post('/history/save', async (req, res) => {
    try {
        const result = new ScanResult(req.body);
        await result.save();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save history' });
    }
});

module.exports = router;
