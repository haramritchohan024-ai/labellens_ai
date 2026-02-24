import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Target, ShieldCheck, Activity, TextSearch, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistoryDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user/history/${id}`);
                if (res.data.success) {
                    setHistory(res.data.history);
                }
            } catch (error) {
                console.error("History Detail Fetch Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistoryDetail();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-50/50">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
        );
    }

    if (!history) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-gray-50/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Not Found</h2>
                <button onClick={() => navigate('/history')} className="text-brand-600 font-bold hover:underline">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const { category, riskScore, riskLevel, summary, detectedAdditives, rawIngredientsText, scannedAt } = history;
    const isHighRisk = riskLevel === 'high';
    const isModerate = riskLevel === 'moderate';

    const getPrimaryColor = () => isHighRisk ? 'red' : isModerate ? 'yellow' : 'green';
    const primaryStr = getPrimaryColor();

    return (
        <div className="min-h-[100vh] pt-28 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Back Link */}
                <button
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-600 font-bold transition-colors mb-4 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to History Log
                </button>

                {/* Primary Diagnostic Envelope */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100"
                >
                    {/* Top Status Bar */}
                    <div className={`px-8 py-6 bg-gradient-to-r ${isHighRisk ? 'from-red-50 to-red-100/50' : isModerate ? 'from-yellow-50 to-yellow-100/50' : 'from-green-50 to-green-100/50'} border-b ${isHighRisk ? 'border-red-100' : isModerate ? 'border-yellow-100' : 'border-green-100'} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                        <div className="flex items-center gap-5">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm bg-white`}>
                                <Activity className={`w-8 h-8 text-${primaryStr}-500`} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{category || "Uncategorized Scan"}</h1>
                                <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">{new Date(scannedAt).toLocaleDateString()} • {new Date(scannedAt).toLocaleTimeString()}</p>
                            </div>
                        </div>

                        {/* Large Score Metric */}
                        <div className="flex items-center gap-6 bg-white py-3 px-6 rounded-[20px] shadow-sm">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5 text-right">Raw Risk Score</p>
                                <p className={`text-3xl font-black text-${primaryStr}-500 leading-none`}>{riskScore}</p>
                            </div>
                            <div className={`px-3.5 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${isHighRisk ? 'bg-red-100 text-red-700' : isModerate ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {riskLevel}
                            </div>
                        </div>
                    </div>

                    {/* Diagnostics Body */}
                    <div className="p-8 space-y-10">

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Target className="w-5 h-5 text-brand-500" /> Assessment Summary
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <p className="text-gray-700 font-medium leading-relaxed">{summary || "No specific summary generated for this scan."}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-brand-500" /> Detected Ingredients
                            </h3>
                            {detectedAdditives && detectedAdditives.length > 0 ? (
                                <ul className="grid sm:grid-cols-2 gap-3">
                                    {detectedAdditives.map((additive, idx) => (
                                        <li key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                                            <span className="font-bold text-gray-800 text-sm">{additive}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 bg-gray-50 rounded-2xl p-5 border border-gray-100">No critical additives found in scan target.</p>
                            )}
                        </div>

                        {/* Raw OCR Block */}
                        {rawIngredientsText && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <TextSearch className="w-5 h-5 text-brand-500" /> Raw Extraction String
                                </h3>
                                <div className="bg-gray-900 text-gray-300 font-mono text-sm leading-relaxed p-6 rounded-2xl whitespace-pre-wrap rounded-br-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                    {rawIngredientsText}
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HistoryDetail;
