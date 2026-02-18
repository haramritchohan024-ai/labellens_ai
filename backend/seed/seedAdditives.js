const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Additive = require('../models/Additive');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const expandedAdditives = [
    {
        code: "E102",
        name: "Tartrazine",
        synonyms: ["Yellow 5", "Food Yellow 4"],
        category: "Color",
        riskLevel: "High",
        safetyStatus: "Controversial",
        regulatoryStatus: "Restricted in some countries (Norway, Austria)",
        penaltyWeight: 1.5,
        description: "Synthetic lemon yellow azo dye. Linked to hyperactivity in children and allergies.",
        groupWarnings: {
            "Child under 12": "⚠️ May cause hyperactivity and attention deficit in children.",
            "Asthma": "⚠️ Can trigger asthma attacks in sensitive individuals."
        }
    },
    {
        code: "E621",
        name: "Monosodium Glutamate",
        synonyms: ["MSG", "Chinese Salt", "Sodium Glutamate", "Ajinomoto"],
        category: "Flavor Enhancer",
        riskLevel: "High",
        safetyStatus: "Controversial",
        penaltyWeight: 1.2,
        description: "Flavor enhancer used in savory foods. Can cause headaches, sweating, and numbness (Chinese Restaurant Syndrome) in sensitive people.",
        groupWarnings: {
            "Headaches / Migraines": "⚠️ Known trigger for migraines.",
            "High Thirst": "⚠️ High sodium content may cause excessive thirst."
        }
    },
    {
        code: "INS 211",
        name: "Sodium Benzoate",
        synonyms: ["E211", "Benzoate of Soda"],
        category: "Preservative",
        riskLevel: "High",
        safetyStatus: "Controversial",
        penaltyWeight: 1.5,
        description: "Common preservative in sodas. When mixed with Vitamin C (Ascorbic Acid), it can form Benzene, a known carcinogen.",
        groupWarnings: {
            "Child Hyperactivity": "⚠️ Linked to hyperactivity when combined with food dyes.",
            "Cancer Risk": "⚠️ Can form carcinogenic Benzene if Vitamin C is present."
        }
    },
    {
        code: "INS 500(ii)",
        name: "Sodium Hydrogen Carbonate",
        synonyms: ["Baking Soda", "E500(ii)", "Sodium Bicarbonate"],
        category: "Raising Agent",
        riskLevel: "Low",
        safetyStatus: "Permitted",
        penaltyWeight: 0.1,
        description: "Commonly used as baking soda. Generally safe but high intake adds to sodium load.",
        groupWarnings: {
            "BP / Sodium Sensitivity": "⚠️ Contributes to daily sodium intake."
        }
    },
    {
        code: "E322",
        name: "Lecithin",
        synonyms: ["Soy Lecithin", "INS 322"],
        category: "Emulsifier",
        riskLevel: "Low",
        safetyStatus: "Permitted",
        penaltyWeight: 0,
        description: "Derived from soy or eggs. Used to mix oil and water. Generally safe/beneficial unless allergic.",
        groupWarnings: {
            "Soy Allergy": "⚠️ Contains Soy."
        }
    },
    {
        code: "INS 951",
        name: "Aspartame",
        synonyms: ["E951", "NutraSweet", "Equal"],
        category: "Sweetener",
        riskLevel: "High",
        safetyStatus: "Controversial",
        penaltyWeight: 1.5,
        description: "Artificial sweetener. Controversial history regarding headaches and neurological effects.",
        groupWarnings: {
            "Headaches / Migraines": "⚠️ Common migraine trigger.",
            "Gut Sensitivity": "⚠️ May alter gut microbiome."
        }
    },
    // Add more samples to reach coverage
];

const seedAdditives = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Clear existing to accept new schema
        // In real prod, we would upsert. For dev fix, we clear to ensure schema update.
        await Additive.deleteMany({});
        console.log("Cleared old additives.");

        await Additive.insertMany(expandedAdditives);
        console.log(`Seeded ${expandedAdditives.length} additives with Synonyms & Risk Data.`);

        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedAdditives();
