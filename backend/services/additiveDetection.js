const Additive = require('../models/Additive');

/**
 * Detects additives from text using regex and DB lookup
 * @param {string} text - The input ingredients text
 * @returns {Promise<Object>} - Detected additives codes and names
 */
/**
 * Normalizes a code string to a standard searchable format
 * e.g., "ins-621" -> "621", "e621" -> "621", "500(ii)" -> "500ii"
 */
const normalizeCode = (raw) => {
    return raw.toLowerCase()
        .replace(/[^a-z0-9]/g, '') // remove spaces, dashes, brackets? 
        // Actually we want "500(ii)" to match database "INS 500(ii)" -> maybe just keep numeric part for fuzzy?
        // Let's stick to generating variants.
        .replace(/^e|^ins/i, ''); // Remove prefix
};

/**
 * Detects additives from text using regex and DB lookup
 * @param {string} text - The input ingredients text
 * @returns {Promise<Object>} - Detected additives codes and names
 */
const detectAdditivesFromText = async (text) => {
    console.log(`\n--- Detection Start ---`);
    // 1. Normalize Text: Lowercase, single spaces
    // We KEEP brackets because "500(ii)" is meaningful.
    const normalizedText = text.toLowerCase()
        .replace(/\s+/g, ' ');

    // 2. Fetch all additives (Prod: Cache this)
    const allAdditives = await Additive.find({});

    const detectedAdditives = [];
    const unknownAdditives = [];

    // Helper to escape regex
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    allAdditives.forEach(additive => {
        let isMatch = false;
        let matchSource = "";

        // --- A. CODE MATCHING ---
        // Clean DB Code: "INS 500(ii)" -> ["INS 500(ii)", "500(ii)", "500ii"]
        const codeVariants = [additive.code]; // Original

        // Add E-number / INS-number variants
        if (additive.code.match(/^(E|INS)\s*(\d+[a-z]*(\(.*\))?)$/i)) {
            const numPart = additive.code.match(/^(E|INS)\s*(\d+[a-z]*(\(.*\))?)$/i)[2];
            codeVariants.push(numPart); // "500(ii)"
            codeVariants.push(numPart.replace(/[\(\)]/g, '')); // "500ii"

            // Generate standard forms
            codeVariants.push(`E${numPart}`); // E500(ii)
            codeVariants.push(`INS${numPart}`); // INS500(ii)
            codeVariants.push(`E-${numPart}`);
            codeVariants.push(`INS-${numPart}`);
        }

        // Build Big Regex for Code
        // pattern: \b(E621|621)\b
        // Note: matching just "621" runs risk of false positives if not careful (e.g. calories 621).
        // Safest: strict E/INS prefix OR inside brackets "preservatives (211)"
        // For now, let's look for specific patterns.

        const escapedVariants = codeVariants.map(v => escapeRegExp(v));
        const codeRegex = new RegExp(`\\b(${escapedVariants.join('|')})\\b`, 'i');

        if (codeRegex.test(normalizedText)) {
            isMatch = true;
            matchSource = "Code match";
        }

        // --- B. NAME & SYNONYM MATCHING ---
        if (!isMatch) {
            const namesToCheck = [additive.name, ...(additive.synonyms || [])];
            for (const name of namesToCheck) {
                // Exact phrase match
                if (normalizedText.includes(name.toLowerCase())) {
                    isMatch = true;
                    matchSource = `Name match: ${name}`;
                    break;
                }
            }
        }

        if (isMatch) {
            if (!detectedAdditives.find(a => a.code === additive.code)) {
                detectedAdditives.push(additive);
                console.log(`✅ Detected: ${additive.name} [${additive.code}] via ${matchSource}`);
            }
        }
    });

    return {
        detectedAdditives,
        unknownAdditives, // Todo: add logic to find "E-xxx" patterns that aren't in DB
        normalizedText
    };
};

module.exports = { detectAdditivesFromText };
