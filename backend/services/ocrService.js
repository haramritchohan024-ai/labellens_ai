const tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

/**
 * Extracts text from an image file using Tesseract.js
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromImage = async (imagePath) => {
    try {
        console.log(`Starting OCR on: ${imagePath}`);
        const { data: { text, confidence } } = await tesseract.recognize(imagePath, 'eng', {
            logger: m => console.log(m)
        });
        console.log('OCR Completed. Confidence:', confidence);
        return {
            extractedText: text,
            confidence: confidence
        };
    } catch (error) {
        console.error('OCR Error:', error);
        // Fallback mock only if OCR completely fails (optional handling)
        throw new Error('Failed to extract text from image.');
    }
};

module.exports = { extractTextFromImage };
