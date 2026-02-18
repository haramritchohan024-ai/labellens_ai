import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import SafetyIndexMeter from '../components/SafetyIndexMeter';
import TransparencyMeter from '../components/TransparencyMeter';
import AdditiveCard from '../components/AdditiveCard';

const Results = () => {
    const { state } = useLocation();

    if (!state) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700">No results found</h2>
                    <Link to="/scan" className="mt-4 text-green-600 underline">Scan a product first</Link>
                </div>
            </div>
        );
    }

    const {
        safetyScore,
        transparencyScore = 5,
        detectedAdditives = [],
        warningsForUser = [], // Updated key from backend
        alternatives = [],
        frequencyRecommendation,
        scoreBreakdown,
        highRiskForUser = [],
        extractedText,
        debugMode
    } = state;

    // Backend compatibility: backend sends safetyScore, frontend logic used score.
    const finalScore = safetyScore || state.score || 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 pt-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Top Section: Score & Transparency */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid lg:grid-cols-2 gap-8"
                >
                    {/* Safety Score Card */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center justify-between border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
                        <h2 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4">Food Safety Index</h2>
                        <SafetyIndexMeter score={finalScore} />
                        <div className="mt-4 text-center">
                            <p className="text-gray-600 font-medium bg-gray-100 px-4 py-1 rounded-full text-sm inline-block">
                                Recommendation: <span className="font-bold text-gray-800">{frequencyRecommendation || "Use with caution"}</span>
                            </p>
                        </div>
                    </div>

                    {/* Transparency & Summary Card */}
                    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col justify-center border border-gray-100">
                        <h2 className="text-gray-800 text-xl font-bold mb-4">Label Analysis</h2>

                        <div className="mb-6">
                            <TransparencyMeter score={transparencyScore} />
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h4 className="flex items-center text-blue-800 font-bold mb-2">
                                <Info size={18} className="mr-2" /> Quick Summary
                            </h4>
                            <p className="text-sm text-blue-900 leading-relaxed">
                                This product contains <strong className="text-blue-700">{detectedAdditives.length} additives</strong>.
                                {detectedAdditives.some(a => a.riskLevel === 'High')
                                    ? " High-risk ingredients detected. Check details below."
                                    : " mostly low-risk ingredients."}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Personalized Alerts */}
                {(warningsForUser.length > 0 || highRiskForUser.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm"
                    >
                        <div className="flex items-start">
                            <div className="bg-red-100 p-2 rounded-full text-red-600 mr-4 mt-1">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-800 mb-2">High Risk for YOU</h3>
                                <p className="text-sm text-red-600 mb-3">
                                    Based on your profile, we found specific concerns:
                                </p>
                                <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                                    {/* Backend sends warningsForUser as strings or we derive from highRiskForUser */}
                                    {warningsForUser.map((w, i) => (
                                        <li key={i} className="text-sm text-red-800 flex items-start font-medium">
                                            <span className="mr-2 text-red-500">•</span> {w.replace('⚠️', '').trim()}
                                        </li>
                                    ))}
                                    {/* Fallback if backend doesn't send warnings list but sends highRisk names */}
                                    {warningsForUser.length === 0 && highRiskForUser.map((name, i) => (
                                        <li key={`h-${i}`} className="text-sm text-red-800 flex items-start font-medium">
                                            <span className="mr-2 text-red-500">•</span> Avoid {name} (High Risk)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Additives Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                            <span className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-600"><Info size={24} /></span>
                            What's Inside?
                        </h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider border px-2 py-1 rounded">
                            BIS/FSSAI Aligned
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {detectedAdditives.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <CheckCircle size={48} className="mx-auto text-green-300 mb-4" />
                                <h4 className="text-lg font-bold text-gray-500">No Additives Detected</h4>
                                <p className="text-gray-400 text-sm">This product appears to be free of common E-numbered additives.</p>
                            </div>
                        ) : (
                            detectedAdditives.map((additive, index) => (
                                <AdditiveCard key={index} additive={additive} />
                            ))
                        )}
                    </div>
                </div>

                {/* Alternatives */}
                {alternatives.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 border border-green-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>

                        <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center relative z-10">
                            <CheckCircle className="mr-2" /> Better Alternatives
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6 relative z-10">
                            {alternatives.map((alt, idx) => (
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    key={idx}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-green-100"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-gray-900">{alt.name}</h5>
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{alt.score}/10</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">{alt.whyBetter}</p>
                                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 border-t pt-3">
                                        <span className="bg-gray-50 px-2 py-1 rounded">{alt.additiveReduction}</span>
                                        <span>{alt.cost}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Debug Panel */}
                {debugMode && (
                    <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-xs overflow-x-auto shadow-inner border border-gray-700">
                        <h4 className="text-white font-bold mb-2 border-b border-gray-700 pb-2">Developer Debug Info</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong className="text-gray-500">Extracted Text:</strong>
                                <pre className="whitespace-pre-wrap mt-1 text-gray-300 bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">{extractedText}</pre>
                            </div>
                            <div>
                                <strong className="text-gray-500">Score Breakdown:</strong>
                                <pre className="mt-1 text-blue-300">{JSON.stringify(scoreBreakdown, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center pt-8">
                    <Link to="/scan" className="bg-gray-900 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center">
                        <Scan size={20} className="mr-2" /> Scan Another Label
                    </Link>
                </div>
            </div>
        </div>
    );
};

function textWarningSummary(score) {
    if (score >= 8) return "Seems mostly safe for regular consumption.";
    if (score >= 5) return "Use in moderation. Contains some additives of concern.";
    return "High processing detected. Best to limit consumption.";
}

export default Results;
