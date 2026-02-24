import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryCard = ({ item, onClick, index }) => {
    // Helper to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Risk Badge Styling
    const getRiskStyles = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-700';
            case 'high': return 'bg-red-100 text-red-700';
            case 'moderate':
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const getRiskLabel = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'Low Risk';
            case 'high': return 'High Risk';
            case 'moderate':
            default: return 'Moderate Risk';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={onClick}
            className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between cursor-pointer group"
        >
            <div className="flex-1 pr-6">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {item.category || "Uncategorized Scan"}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${getRiskStyles(item.riskLevel)}`}>
                        {getRiskLabel(item.riskLevel)}
                    </span>
                </div>

                <p className="text-sm text-gray-500 font-medium line-clamp-1 mb-3">
                    Detected: {item.detectedAdditives?.length > 0 ? item.detectedAdditives.join(', ') : 'No critical additives triggers'}
                </p>

                <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>{formatDate(item.scannedAt)}</span>
                </div>
            </div>

            <div className="flex items-center gap-6 pl-6 border-l border-gray-100">
                <div className="text-right min-w-[60px]">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Score</p>
                    <p className={`text-2xl font-black ${item.riskLevel === 'high' ? 'text-red-500' : item.riskLevel === 'moderate' ? 'text-yellow-500' : 'text-green-500'}`}>
                        {item.riskScore}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                    <ChevronRight className="text-gray-400 group-hover:text-brand-500 transition-colors w-5 h-5" />
                </div>
            </div>
        </motion.div>
    );
};

export default HistoryCard;
