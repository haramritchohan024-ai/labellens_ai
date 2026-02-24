import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Scan, Activity, ArrowLeft, Loader, Sparkles, Tag, ChevronRight, Flag, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SafetyIndexMeter from '../components/SafetyIndexMeter';
import AdditiveCard from '../components/AdditiveCard';
import AlternativeCard from '../components/AlternativeCard';

const Results = () => {
    const { state } = useLocation();

    if (!state) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-6">
                <div className="text-center p-10 bg-white rounded-3xl shadow-xl max-w-sm w-full mx-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Scan size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No results found</h2>
                    <p className="text-gray-500 mb-8 text-sm">You need to scan a product label to see its safety analysis.</p>
                    <Link to="/scan" className="block w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors">
                        Scan a Product
                    </Link>
                </div>
            </div>
        );
    }

    const {
        score = 0, // 0-100
        riskLevel = "Unknown",
        additivesFound = [],
        unknownAdditives = [],
        summary,
        detectedCategory, // The new Hybrid Object from the Scanner
        extractedText,
        debugMode
    } = state;

    // Convert 0-100 score to 0-10 for the meter
    const safetyIndex = score / 10;

    const [showAlternatives, setShowAlternatives] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    // Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportForm, setReportForm] = useState({ complaintText: '' });
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [reportStatus, setReportStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    // Recover token for requests
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setReportStatus({ type: 'error', message: 'You must be logged in to submit a report.' });
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (reportForm.complaintText.length < 20) {
            setReportStatus({ type: 'error', message: 'Please provide at least 20 characters.' });
            return;
        }

        setIsSubmittingReport(true);
        setReportStatus(null);

        try {
            await axios.post('http://localhost:5000/api/reports', {
                productName: detectedCategory?.secondary || 'Unknown Scanner Product',
                category: detectedCategory?.primary || 'Uncategorized',
                subcategory: detectedCategory?.secondary || 'Uncategorized',
                complaintText: reportForm.complaintText,
                scanId: state.scannerId || null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReportStatus({ type: 'success', message: 'Your report has been submitted successfully.' });
            setTimeout(() => {
                setIsReportModalOpen(false);
                setReportStatus(null);
                setReportForm({ complaintText: '' });
            }, 3000);
        } catch (err) {
            setReportStatus({ type: 'error', message: err.response?.data?.error || 'Failed to submit report. You may have reached the limit.' });
        } finally {
            setIsSubmittingReport(false);
        }
    };


    // The backend now injects `alternatives` mapped from the DB directly inside the analysis payload
    const backendAlternatives = state.alternatives || [];

    // Apply Smart Filters
    const alternatives = useMemo(() => {
        if (!backendAlternatives) return [];
        let filtered = [...backendAlternatives];
        if (activeFilter === 'Low Risk') filtered = filtered.filter(a => a.riskLevel === 'low');
        if (activeFilter === 'Vegan') filtered = filtered.filter(a => a.dietaryTags?.includes('Vegan'));
        if (activeFilter === 'Gluten-Free') filtered = filtered.filter(a => a.dietaryTags?.includes('Gluten-Free'));
        if (activeFilter === 'Clean Label') filtered = filtered.filter(a => a.cleanLabel);
        return filtered;
    }, [backendAlternatives, activeFilter]);

    const isLoadingAlts = false;
    const filterContext = null;
    let altMessage = '';

    if (backendAlternatives.length === 0) {
        altMessage = "We couldn't identify distinct alternatives for this specific category yet.";
    }



    const displayedAdditives = additivesFound.map(a => ({
        ...a,
        riskLevel: a.risk,
        description: a.reason,
        category: a.category || "Additive"
    }));

    // Calculate risk distribution for the bar graph
    const riskCounts = useMemo(() => {
        let high = 0, medium = 0, low = 0;
        displayedAdditives.forEach(a => {
            const r = a.riskLevel?.toLowerCase();
            if (r === 'high') high++;
            else if (r === 'medium') medium++;
            else if (r === 'low') low++;
            else low++; // default unknown to low for visual purposes or separate bucket
        });
        const total = Math.max(1, high + medium + low);
        return {
            high, medium, low, total,
            highPct: (high / total) * 100,
            medPct: (medium / total) * 100,
            lowPct: (low / total) * 100,
        };
    }, [displayedAdditives]);

    return (
        <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Action */}
                <div className="flex items-center justify-between">
                    <Link to="/scan" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
                        <ArrowLeft size={16} /> Back to Scanner
                    </Link>
                </div>

                {/* Top Section: Dashboard Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="grid lg:grid-cols-12 gap-6"
                >
                    {/* Safety Score Gauge */}
                    <div className="lg:col-span-5 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-900/5 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-400 via-yellow-400 to-red-400 opacity-80"></div>
                        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-8">Overall Safety Score</h2>
                        <SafetyIndexMeter score={safetyIndex} />
                    </div>

                    {/* Analysis Summary & Distribution */}
                    <div className="lg:col-span-7 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-900/5 p-8 flex flex-col justify-between">

                        <div>
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                                        <Activity size={20} />
                                    </div>
                                    <h2 className="text-gray-900 text-xl font-bold">AI Health Summary</h2>
                                </div>
                                <button
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-100"
                                >
                                    <Flag size={14} /> Report Issue
                                </button>
                            </div>
                            <p className="text-base text-gray-600 leading-relaxed mb-8">
                                {summary || textWarningSummary(safetyIndex)}
                            </p>
                        </div>

                        {/* Risk Distribution Bar Graph */}
                        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Risk Distribution</h4>
                            <div className="space-y-4">
                                {/* Bar */}
                                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${riskCounts.lowPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-green-500"></motion.div>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${riskCounts.medPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-yellow-500"></motion.div>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${riskCounts.highPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-red-500"></motion.div>
                                </div>
                                {/* Legends */}
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        <span className="text-gray-600">{riskCounts.low} Low</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                        <span className="text-gray-600">{riskCounts.medium} Medium</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                        <span className="text-gray-600">{riskCounts.high} High</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* Personalized Alerts */}
                {riskLevel === 'Unsafe' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className="bg-red-100 p-3 rounded-2xl text-red-600 shadow-sm">
                                <ShieldAlert size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-900 mb-1">High Risk Alert</h3>
                                <p className="text-sm text-red-700/90 leading-relaxed max-w-3xl">
                                    This product contains multiple high-risk additives that may have long-term health implications. It is highly recommended to seek safer alternatives or limit consumption.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Additives Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                                Ingredients Breakdown
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">Detailed analysis of {displayedAdditives.length} detected ingredients.</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <CheckCircle size={16} className="text-brand-500" /> BIS/FSSAI Aligned
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedAdditives.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center p-16 bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl">
                                <div className="bg-brand-50 p-4 rounded-full mb-4">
                                    <CheckCircle size={40} className="text-brand-500" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-700 mb-2">No Harmful Additives Detected</h4>
                                <p className="text-gray-500 text-center max-w-sm">This product appears to be free of common artificial E-numbered additives.</p>
                            </div>
                        ) : (
                            displayedAdditives.map((additive, index) => (
                                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + (index * 0.1) }}>
                                    <AdditiveCard additive={additive} />
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Safe Alternatives Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="border-t border-gray-200 pt-16 pb-8"
                >
                    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-12">
                        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-100">
                            <Sparkles className="text-brand-500 w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-4">Alternative Safe Food Options</h3>
                        <p className="text-gray-500 text-lg">Looking for healthier choices? Select the product category to discover safer alternatives curated by our AI.</p>

                        {!showAlternatives ? (
                            <button
                                onClick={() => setShowAlternatives(true)}
                                className="mt-8 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
                            >
                                Find Safer Alternatives
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-8 w-full p-6 bg-white border border-brand-100 rounded-3xl shadow-sm max-w-lg mx-auto"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-xl text-white ${detectedCategory?.isAiDetected ? 'bg-purple-500 shadow-purple-200' : 'bg-brand-500 shadow-brand-200'} shadow-inner`}>
                                            {detectedCategory?.isAiDetected ? <Sparkles size={20} /> : <Scan size={20} />}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-0.5">
                                                {detectedCategory?.isAiDetected ? 'AI Auto-Classified' : 'User Context Override'}
                                            </p>
                                            <h4 className="text-lg font-bold text-gray-900 leading-tight">
                                                {detectedCategory?.secondary || 'Unknown Item'}
                                            </h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Tag size={12} /> {detectedCategory?.primary || 'Uncategorized'}
                                            </p>
                                        </div>
                                    </div>

                                    {backendAlternatives && backendAlternatives.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-brand-100/50">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-3 tracking-widest text-center">Smart Filters</p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {['All', 'Low Risk', 'Clean Label', 'Vegan', 'Gluten-Free'].map(filter => (
                                                    <button
                                                        key={filter}
                                                        onClick={() => setActiveFilter(filter)}
                                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeFilter === filter ? 'bg-brand-500 text-white shadow-brand-200' : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-white hover:border-brand-200 hover:text-brand-600'}`}
                                                    >
                                                        {filter}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <AnimatePresence>
                        {showAlternatives && (isLoadingAlts || alternatives.length > 0 || altMessage) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4"
                            >
                                {alternatives.length === 0 ? (
                                    <div className="text-center p-12 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-inner">
                                        <h4 className="text-xl font-bold text-gray-400">No alternatives found matching these filters.</h4>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {alternatives.map((alt, idx) => {
                                            const stringifiedContext = {
                                                detectedCategory,
                                                score,
                                                safetyIndex,
                                                additivesFound,
                                                extractedText
                                            };
                                            return (
                                                <motion.div
                                                    key={alt._id || idx}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                >
                                                    <AlternativeCard product={alt} scannedRiskScore={score} scannedProductStringified={stringifiedContext} />
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Debug Panel */}
                {debugMode && (
                    <div className="bg-gray-900 text-green-400 p-6 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-gray-700">
                        <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">Developer Debug Info</h4>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <strong className="text-gray-500 block mb-2">Extracted Text:</strong>
                                <pre className="whitespace-pre-wrap text-gray-300 bg-gray-800 p-4 rounded-xl max-h-48 overflow-y-auto">{extractedText}</pre>
                            </div>
                            <div>
                                <strong className="text-gray-500 block mb-2">Score Analytics:</strong>
                                <pre className="text-blue-300 bg-gray-800 p-4 rounded-xl">Score: {score}</pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {isReportModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                        <Flag size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-lg">Report Product</h3>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Help improve accuracy</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isSubmittingReport && setIsReportModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleReportSubmit} className="p-6 space-y-5">
                                {reportStatus && (
                                    <div className={`p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${reportStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {reportStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                        {reportStatus.message}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Product Name (Detected)</label>
                                        <input type="text" readOnly value={detectedCategory?.secondary || 'Unknown Scanner Product'} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium focus:outline-none" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
                                            <input type="text" readOnly value={detectedCategory?.primary || 'Uncategorized'} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium text-sm focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Subcategory</label>
                                            <input type="text" readOnly value={detectedCategory?.secondary || 'Uncategorized'} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium text-sm focus:outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Complaint Description *</label>
                                        <textarea
                                            placeholder="Please describe why this product analysis is inaccurate. (Min 20 characters)"
                                            rows="4"
                                            required
                                            disabled={isSubmittingReport}
                                            value={reportForm.complaintText}
                                            onChange={(e) => setReportForm({ ...reportForm, complaintText: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
                                        ></textarea>
                                        <span className="text-xs text-gray-400 font-medium mt-1 block">
                                            {reportForm.complaintText.length} / 20 required characters
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsReportModalOpen(false)}
                                        disabled={isSubmittingReport}
                                        className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReport || reportStatus?.type === 'success'}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {isSubmittingReport ? <Loader2 size={18} className="animate-spin" /> : 'Submit Report'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

function textWarningSummary(score) {
    if (score >= 8) return "This product is mostly composed of safe ingredients and is generally fine for regular consumption.";
    if (score >= 5) return "Use in moderation. This product contains some additives that may be of concern for sensitive individuals.";
    return "High level of ultra-processing detected. It is best to limit consumption or seek natural alternatives.";
}

export default Results;
