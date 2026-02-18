import React from 'react';
import { motion } from 'framer-motion';

const SafetyIndexMeter = ({ score }) => {
    // 0-4 Red (Bad), 5-7 Yellow (Avg), 8-10 Green (Good)
    const getColor = (s) => {
        if (s >= 8) return '#10B981'; // Green
        if (s >= 5) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    const getVerdict = (s) => {
        if (s >= 8) return 'Safe';
        if (s >= 5) return 'Moderate';
        return 'Risky';
    };

    // Calculate rotation degree. 
    // -90deg is 0, 90deg is 10.
    // Range is 180deg.
    // score 0 -> -90
    // score 10 -> 90
    // formula: (score / 10) * 180 - 90
    const rotateDeg = (score / 10) * 180 - 90;

    return (
        <div className="relative w-48 h-24 overflow-hidden flex justify-center items-end">
            {/* Background Arc */}
            <div className="absolute w-40 h-40 rounded-full border-[12px] border-gray-200 top-0 box-border"></div>

            {/* Colored Arc (SVG for gradient control would be better but CSS rotated semi-circle is simple) */}
            {/* Let's use a simple SVG for better control */}
            <svg viewBox="0 0 100 50" className="w-full h-full absolute top-0 left-0">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <motion.path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={getColor(score)}
                    strokeWidth="10"
                    strokeDasharray="126" // approx circumference of half circle r=40
                    strokeDashoffset={126 - (126 * (score / 10))}
                    initial={{ strokeDashoffset: 126 }}
                    animate={{ strokeDashoffset: 126 - (126 * (score / 10)) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>

            {/* Score Text */}
            <div className="z-10 text-center mb-1">
                <span className="text-3xl font-black text-gray-800">{score.toFixed(1)}</span>
                <p className="text-xs uppercase font-bold tracking-wider" style={{ color: getColor(score) }}>{getVerdict(score)}</p>
            </div>
        </div>
    );
};

export default SafetyIndexMeter;
