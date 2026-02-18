const { extractTextFromImage } = require('./services/ocrService');
const path = require('path');

// Mock image path - user needs to provide a real one or we can try to use a dummy file if it existed.
// But we actually need a valid image file to test tesseract.
// Let's create a simple text file and rename it to .png? No that won't work for OCR.
// We will just try to run it on a non-existent file and see if it handles it (it should error 'file not found'),
// or if we have an image in uploads we can use.

const testOCR = async () => {
    try {
        // Just check if we can load the module and run the function, even if it fails on file not found.
        console.log("Testing OCR module...");

        // This will likely fail with ENOENT, but will confirm Tesseract initializes.
        const result = await extractTextFromImage('dummy_image.png');
        console.log(result);
    } catch (error) {
        console.error("Caught expected error or actual failure:");
        console.error(error);
    }
};

testOCR();
