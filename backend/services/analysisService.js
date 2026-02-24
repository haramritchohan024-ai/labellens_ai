const OpenAI = require("openai");
const Additive = require("../models/Additive");
const Alternative = require("../models/Alternative");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const analyzeProduct = async (
    text,
    healthProfile = [],
    sensitivityProfile = [],
    debugMode = false
) => {
    try {
        if (!text) throw new Error("No text provided for analysis");

        // =====================================================
        // 1️⃣ NORMALIZE INPUT & FETCH ADDITIVES
        // =====================================================
        const normalizedText = text.toUpperCase().replace(/\s+/g, ' ');
        let detectedAdditives = [];

        // Fetch all additives from DB
        const allAdditives = await Additive.find({});

        // Helper: normalize code for matching
        const normalizeCode = (code) => code.toUpperCase().replace(/[\s\-\(\)]/g, "");

        // Detect E-numbers / INS codes in text
        const eNumberMatches = normalizedText.match(/\b(E\d{3,4}|INS\s?\d+[A-Z]?(?:\([i]+\))?)\b/g) || [];
        const uniqueENumbers = [...new Set(eNumberMatches)];

        for (const code of uniqueENumbers) {
            const dbMatch = allAdditives.find(a => normalizeCode(a.code) === normalizeCode(code));
            if (dbMatch && !detectedAdditives.some(d => d.code === dbMatch.code)) {
                detectedAdditives.push(dbMatch);
            }
        }

        // Detect additive names and synonyms
        allAdditives.forEach(add => {
            const terms = [add.name, ...(add.synonyms || [])];
            for (const term of terms) {
                if (
                    term && 
                    normalizedText.includes(term.toUpperCase()) &&
                    !detectedAdditives.some(a => a.code === add.code)
                ) {
                    detectedAdditives.push(add);
                    break; // avoid duplicates
                }
            }
        });

        // =====================================================
        // 2️⃣ AI VALIDATION (Optional)
        // =====================================================
        let aiSummary = "";
        let aiAdvice = "";

//         if (detectedAdditives.length > 0) {
//             try {
//                 const aiResponse = await openai.responses.create({
//                     model: "gpt-4.1-mini",
//                     input: `
// These additives were detected:

// ${JSON.stringify(detectedAdditives)}

// Provide:
// 1. Short safety explanation
// 2. Health advice

// Return JSON:
// {
//   "summary": "",
//   "healthAdvice": ""
// }
// `
//                 });

//                 const parsed = JSON.parse(aiResponse.output_text);
//                 aiSummary = parsed.summary || "";
//                 aiAdvice = parsed.healthAdvice || "";
//             } catch (e) {
//                 console.log("AI validation skipped");
//             }
//         }

        // =====================================================
        // 3️⃣ NUTRITION LOGIC
        // =====================================================
        const nutritionFlags = {
            highSugar:
                /SUGAR\s*:\s*(\d+)/i.test(normalizedText) &&
                parseInt(normalizedText.match(/SUGAR\s*:\s*(\d+)/i)[1]) > 10,

            highSodium:
                /SODIUM\s*:\s*(\d+)/i.test(normalizedText) &&
                parseInt(normalizedText.match(/SODIUM\s*:\s*(\d+)/i)[1]) > 400,

            transFatPresent:
                /TRANS\s*FAT|HYDROGENATED/i.test(normalizedText)
        };

        // =====================================================
        // 4️⃣ SCORING LOGIC
        // =====================================================
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

        // Penalty for too many additives
        if (detectedAdditives.length > 3) {
            const countPenalty = (detectedAdditives.length - 3) * 0.5;
            scoreBreakdown.additiveCountPenalty = parseFloat(countPenalty.toFixed(1));
            score -= countPenalty;
        }

        // Penalties for individual additives
        console.log("Detected Additives:", detectedAdditives);
        console.log("Detected Additives Count:", detectedAdditives.length);


       detectedAdditives.forEach(a => {

    const risk = (a.risk || "Low").toLowerCase();

    let penalty = 0;

    if (risk === "high") {
        penalty = 2;
        scoreBreakdown.highRiskPenalty += penalty;
    } 
    else if (risk === "medium") {
        penalty = 1;
        scoreBreakdown.moderateRiskPenalty += penalty;
    } 
    else {
        penalty = 0.2;
        scoreBreakdown.unknownPenalty += penalty;
    }

    score -= penalty;
});
        // Nutrition penalties
        if (nutritionFlags.highSugar) { score -= 1; scoreBreakdown.nutritionPenalty += 1; }
        if (nutritionFlags.highSodium) { score -= 1; scoreBreakdown.nutritionPenalty += 1; }
        if (nutritionFlags.transFatPresent) { score -= 2; scoreBreakdown.nutritionPenalty += 2; }

        // Clamp score 0-10
        score = Math.max(0, Math.min(10, parseFloat(score.toFixed(1))));

        // =====================================================
        // 5️⃣ FREQUENCY RECOMMENDATION
        // =====================================================
        let frequency = "Okay for regular use";
        if (score < 4) frequency = "Avoid / Rare treat";
        else if (score < 7) frequency = "Once a week";
        else if (score < 9) frequency = "2-3 times per week";

        // =====================================================
        // 6️⃣ ALTERNATIVES
        // =====================================================
        let alternatives = [];
        const allAlternativeCats = await Alternative.find({});
        allAlternativeCats.forEach(cat => {
            if (normalizedText.includes(cat.category.toUpperCase())) {
                alternatives.push(...cat.alternatives);
            }
        });

        // =====================================================
        // FINAL RESPONSE
        // =====================================================
        return {
            success: true,
            foodSafetyIndex: score,
            safetyScore: score,
            detectedAdditives,
            scoreBreakdown,
            frequencyRecommendation: frequency,
            aiSummary,
            aiAdvice,
            alternatives: alternatives.slice(0, 3)
        };

    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
};

module.exports = { analyzeProduct };