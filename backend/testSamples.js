const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { detectAdditivesFromText } = require('./services/additiveDetection');

dotenv.config({ path: path.join(__dirname, '.env') });

const testSamples = [
    {
        name: "Hard Sample (Mixed format)",
        text: "Ingredients: Refined wheat flour, sugar, edible vegetable oil (palm), raising agents (INS 500(ii), INS 503(ii)), emulsifier (E322), antioxidant (INS-300), flavours, preservatives (211, 202)"
    },
    {
        name: "Synonym Test",
        text: "Contains: MSG, Chinese Salt, and Baking Soda."
    },
    {
        name: "Clean Label",
        text: "Ingredients: Whole milk, sugar, active culture."
    }
];

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected for Testing...");

        for (const sample of testSamples) {
            console.log(`\nTesting: ${sample.name}`);
            console.log(`Input: "${sample.text}"`);
            const start = Date.now();
            const result = await detectAdditivesFromText(sample.text);
            const duration = Date.now() - start;

            console.log(`Detected (${result.detectedAdditives.length}):`,
                result.detectedAdditives.map(a => `${a.name} [${a.code}]`).join(", ")
            );
            console.log(`Time: ${duration}ms`);
        }

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

runTests();
