import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, Check } from 'lucide-react';

const AdditiveCard = ({ additive }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getRiskStyles = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high': return {
                dot: 'bg-red-500',
                bg: 'bg-red-50 hover:bg-red-100',
                border: 'border-red-200',
                text: 'text-red-800',
                icon: <ShieldAlert size={16} className="text-red-500" />
            };
            case 'medium': return {
                dot: 'bg-yellow-500',
                bg: 'bg-yellow-50 hover:bg-yellow-100',
                border: 'border-yellow-200',
                text: 'text-yellow-800',
                icon: <AlertTriangle size={16} className="text-yellow-500" />
            };
            case 'low': return {
                dot: 'bg-green-500',
                bg: 'bg-green-50 hover:bg-green-100',
                border: 'border-green-200',
                text: 'text-green-800',
                icon: <CheckCircle2 size={16} className="text-green-500" />
            };
            default: return {
                dot: 'bg-gray-400',
                bg: 'bg-gray-50 hover:bg-gray-100',
                border: 'border-gray-200',
                text: 'text-gray-700',
                icon: <AlertTriangle size={16} className="text-gray-400" />
            };
        }
    };

    const styles = getRiskStyles(additive.riskLevel);

    return (
        <div className={`rounded-2xl border ${styles.border} overflow-hidden transition-all duration-300 bg-white ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full text-left px-5 py-4 ${styles.bg} transition-colors flex items-center justify-between group`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${styles.dot} shadow-sm ring-4 ring-white`}></div>
                    <div>
                        <h4 className={`font-bold text-lg ${styles.text} flex items-center gap-2`}>
                            {additive.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono bg-white/60 px-2 py-0.5 rounded text-gray-600 font-semibold border border-black/5">
                                {additive.code}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                {additive.category}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-white/50 px-2 py-1 rounded-full">
                        {styles.icon}
                        <span className={`text-xs font-bold ${styles.text} uppercase tracking-wider`}>
                            {additive.riskLevel} Risk
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-gray-400 group-hover:text-gray-600 bg-white shadow-sm rounded-full p-1 border border-gray-100"
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 bg-white border-t border-gray-50 space-y-5">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Column: Description & Warnings */}
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
                                            What it is
                                        </h5>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {additive.description || additive.notes || "No additional description available."}
                                        </p>
                                    </div>

                                    {additive.groupWarnings && Object.keys(additive.groupWarnings).length > 0 && (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                            <h5 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <ShieldAlert size={14} /> Why it may be risky
                                            </h5>
                                            <ul className="text-sm text-red-700 space-y-1.5 ml-1">
                                                {Object.entries(additive.groupWarnings).map(([key, msg]) => (
                                                    <li key={key} className="flex items-start gap-1.5">
                                                        <span className="mt-1 flex-shrink-0 min-w-1 min-h-1 rounded-full bg-red-400 block w-1 h-1"></span>
                                                        {msg}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Sensitivity Tags */}
                                    {additive.sensitivityTags && additive.sensitivityTags.length > 0 && (
                                        <div>
                                            <h5 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <AlertTriangle size={14} /> Health Goal Impact
                                            </h5>
                                            <div className="flex flex-wrap gap-1.5">
                                                {additive.sensitivityTags.map((tag, i) => (
                                                    <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Alternatives & Regulatory */}
                                <div className="space-y-4">
                                    {/* Mock Safer alternatives since backend doesn't provide them yet, 
                                        but prompt requested it. We'll show a placeholder based on category */}
                                    <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 h-full flex flex-col">
                                        <h5 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-brand-200 pb-2">
                                            <CheckCircle2 size={16} /> Safer Alternatives
                                        </h5>
                                        <ul className="text-sm text-brand-800 space-y-3 flex-1">
                                            <li className="flex items-start gap-2 bg-white/60 p-2 text-brand-700 rounded-lg shadow-sm border border-brand-200/50">
                                                <Check className="text-brand-500 mt-0.5" size={16} />
                                                <span>Look for products with natural {additive.category?.toLowerCase() || 'ingredients'} instead.</span>
                                            </li>
                                        </ul>
                                        <div className="mt-auto pt-4 relative">
                                            <div className="text-xs text-brand-600 mt-2 bg-white px-3 py-2 rounded-lg border border-brand-100 flex items-start gap-2">
                                                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                                                <p>Regulatory Status: <span className="font-semibold">{additive.regulatoryStatus || "Permitted (Subject to limit)"}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdditiveCard;
