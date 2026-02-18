import React from 'react';
import { motion } from 'framer-motion';

const TransparencyMeter = ({ score }) => {
    return (
        <div className="w-full p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h4 className="font-bold text-gray-700 text-sm">Label Transparency Score</h4>
                    <p className="text-xs text-gray-500">Clarity of ingredients (BIS compliant)</p>
                </div>
                <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">{score.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs">/10</span>
                </div>
            </div>
            {/* Bar */}
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / 10) * 100}%` }}
                    transition={{ duration: 1 }}
                />
            </div>
            {score < 5 && (
                <p className="text-xs text-orange-500 mt-2 font-medium">⚠️ Includes vague terms like "flavours" or "oil".</p>
            )}
        </div>
    );
};

export default TransparencyMeter;
