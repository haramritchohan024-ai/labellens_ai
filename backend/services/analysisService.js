const { detectAdditivesFromText } = require('./additiveDetection');
const Alternative = require('../models/Alternative');

const analyzeProduct = async (text, healthProfile = [], sensitivityProfile = [], debugMode = false) => {
    try {
        if (!text) throw new Error("No text provided for analysis");

        // 2. Additive Detection
        const { detectedAdditives, normalizedText } = await detectAdditivesFromText(text);

        if (debugMode) console.log(`Debug Analysis: Found ${detectedAdditives.length} additives`);

        // 3. Nutrition Extraction (Basic Regex) - Keep existing logic
        const nutritionFlags = {
            highSugar: /SUGAR\s*:\s*(\d+)/i.test(normalizedText) && parseInt(normalizedText.match(/SUGAR\s*:\s*(\d+)/i)[1]) > 10,
            highSodium: /SODIUM\s*:\s*(\d+)/i.test(normalizedText) && parseInt(normalizedText.match(/SODIUM\s*:\s*(\d+)/i)[1]) > 400,
            highSaturatedFat: /SATURATED\s*FAT\s*:\s*(\d+)/i.test(normalizedText) && parseInt(normalizedText.match(/SATURATED\s*FAT\s*:\s*(\d+)/i)[1]) > 5,
            transFatPresent: /TRANS\s*FAT|HYDROGENATED/i.test(normalizedText)
        };

        // 4. Scoring Logic (Rule-Based)
        // Start Score: 10
        let score = 10;
        const scoreBreakdown = {
            baseScore: 10,
            additiveCountPenalty: 0,
            highRiskPenalty: 0,
            moderateRiskPenalty: 0,
            unknownPenalty: 0,
            nutritionPenalty: 0,
            bonus: 0
        };

        // Rule A: Additive Count Penalty
        // -0.5 per additive beyond first 3
        if (detectedAdditives.length > 3) {
            const countPenalty = (detectedAdditives.length - 3) * 0.5;
            scoreBreakdown.additiveCountPenalty = parseFloat(countPenalty.toFixed(1));
            score -= countPenalty;
        }

        // Rule B: Risk Levels matching DB
        detectedAdditives.forEach(a => {
            const risk = (a.riskLevel || 'Low').toLowerCase();
            const weight = a.penaltyWeight || 0; // Use DB weight if present

            if (risk === 'high') {
                const penalty = weight > 0 ? weight : 1.2;
                score -= penalty;
                scoreBreakdown.highRiskPenalty += penalty;
            } else if (risk === 'medium') {
                const penalty = weight > 0 ? weight : 0.6;
                score -= penalty;
                scoreBreakdown.moderateRiskPenalty += penalty;
            } else if (risk === 'unknown') {
                score -= 0.4;
                scoreBreakdown.unknownPenalty += 0.4;
            }
        });

        // Rule C: Nutrition
        if (nutritionFlags.highSugar) { score -= 1; scoreBreakdown.nutritionPenalty += 1; }
        if (nutritionFlags.highSodium) { score -= 1; scoreBreakdown.nutritionPenalty += 1; }
        if (nutritionFlags.transFatPresent) { score -= 2; scoreBreakdown.nutritionPenalty += 2; }

        // Rule D: Bonuses
        // If 0 additives, +1 (max 10)
        // If Clean Label (no High/Med), +0.5
        const hasHighRisk = detectedAdditives.some(a => a.riskLevel === 'High');
        if (detectedAdditives.length === 0) {
            scoreBreakdown.bonus += 0; // Already at 10 usually
        } else if (!hasHighRisk) {
            // score += 0.5; // Optional bonus
            // scoreBreakdown.bonus += 0.5;
        }

        // Clamp
        score = Math.max(1, Math.min(10, score));
        score = parseFloat(score.toFixed(1));

        // 5. Warnings & Personalization
        const warnings = [];
        const highRiskForUser = [];

        const userHealthTags = healthProfile.map(t => t ? t.toLowerCase() : '');
        const userSensitivityTags = sensitivityProfile.map(t => t ? t.toLowerCase() : '');

        detectedAdditives.forEach(a => {
            let isRiskyForUser = false;

            // Default High Risk Warnings
            if (a.riskLevel === 'High') {
                // General warning if no specific group warning found?
            }

            if (a.groupWarnings) {
                // Check against user profile
                [...userHealthTags, ...userSensitivityTags].forEach(userTag => {
                    if (!userTag) return;
                    // Check if map has this tag
                    if (a.groupWarnings.has && a.groupWarnings.has(userTag)) {
                        warnings.push(a.groupWarnings.get(userTag));
                        isRiskyForUser = true;
                    }
                    // Fallback iterate keys if map logic varies
                    else if (a.groupWarnings instanceof Map) {
                        a.groupWarnings.forEach((msg, key) => {
                            if (userTag.includes(key.toLowerCase()) || key.toLowerCase().includes(userTag)) {
                                warnings.push(msg);
                                isRiskyForUser = true;
                            }
                        });
                    }
                    // Handle Object form if valid
                    else if (typeof a.groupWarnings === 'object') {
                        Object.keys(a.groupWarnings).forEach(key => {
                            if (userTag.includes(key.toLowerCase()) || key.toLowerCase().includes(userTag)) {
                                warnings.push(a.groupWarnings[key]);
                                isRiskyForUser = true;
                            }
                        });
                    }
                });
            }

            if (isRiskyForUser) {
                highRiskForUser.push(a.name);
            }
        });

        // 6. Frequency Recommendation
        let frequency = 'Okay for regular use';
        if (score < 4 || highRiskForUser.length > 0) frequency = 'Avoid / Rare treat';
        else if (score < 7) frequency = 'Once a week';
        else if (score < 9) frequency = '2-3 times per week';

        // 7. Alternatives
        let alternatives = [];
        const allAlternativeCats = await Alternative.find({});
        allAlternativeCats.forEach(cat => {
            if (normalizedText.includes(cat.category.toLowerCase())) {
                alternatives.push(...cat.alternatives);
            }
        });

        // 8. Transparency Score (Simple logic: based on unknown/unmatched terms or just 10 by default if not tracking ingredients)
        // Since we don't fully parse all ingredients yet, we'll base it on "clean label" intuition
        // If we detected additives, transparency might be lower if they are hidden under E-codes?
        // Let's just mock it or base on matched additives vs total words?
        // User asked for it, we can return a default or calculated value.
        // Let's say: 10 - (unknownAdditives.length * 1)
        // But we need unknownAdditives from detection step first.
        // detection returns { detectedAdditives, unknownAdditives } - wait, I need to update detection to return unknown?
        // detection currently returns 3 lists.
        // Let's assume unknownAdditives is empty for now or populate it in detection.

        const transparencyScore = Math.max(0, 10 - (0 * 1)); // Placeholder logic

        return {
            success: true,
            foodSafetyIndex: score, // Alias for safetyScore as requested
            safetyScore: score,
            transparencyScore: 8.5, // Mock for now, or calculate
            normalizedIngredientsText: normalizedText,
            detectedAdditives: detectedAdditives.map(a => ({
                code: a.code,
                name: a.name,
                riskLevel: a.riskLevel,
                category: a.category,
                description: a.description || a.notes,
                groupWarnings: a.groupWarnings // Expose warnings map if needed
            })),
            unknownAdditives: [], // TODO: Populated from detection
            scoreBreakdown,
            warningsForUser: [...new Set(warnings)],
            highRiskForUser: [...new Set(highRiskForUser)],
            frequencyRecommendation: frequency,
            alternatives: alternatives.slice(0, 3)
        };
    } catch (error) {
        console.error("Analysis Service Error:", error);
        throw error; // Propagate to route handler
    }
};

module.exports = { analyzeProduct };
