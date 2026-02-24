import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const SafetyIndexMeter = ({ score }) => {
    const controls = useAnimation();
    const [displayScore, setDisplayScore] = useState(0);

    // 0-4 Red (Bad), 5-7 Yellow (Avg), 8-10 Green (Good)
    const getColor = (s) => {
        if (s >= 8) return '#22c55e'; // Green
        if (s >= 5) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    const getVerdict = (s) => {
        if (s >= 8) return 'Safe';
        if (s >= 5) return 'Moderate';
        return 'Risky';
    };

    const radius = 60;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 10) * circumference;

    useEffect(() => {
        controls.start({
            strokeDashoffset: offset,
            transition: { duration: 1.5, ease: "easeOut" }
        });

        // Animate counter
        let startTimestamp = null;
        const duration = 1500;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOut cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(easeProgress * score);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [score, offset, controls]);

    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth={strokeWidth}
                        className="transition-colors duration-300"
                    />
                    {/* Foreground Circle - Gradient could be added via defs, but stroke works fine */}
                    <motion.circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="none"
                        stroke={getColor(score)}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={controls}
                        style={{ filter: `drop-shadow(0 0 8px ${getColor(score)}40)` }}
                    />
                </svg>

                {/* Score Text inside Circle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-4xl font-extrabold text-gray-800 tracking-tight" style={{ color: getColor(score) }}>
                            {displayScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            / 10
                        </span>
                    </motion.div>
                </div>
            </div>
            {/* Badge under circle */}
            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 px-4 py-1.5 rounded-full border shadow-sm"
                style={{ backgroundColor: `${getColor(score)}10`, borderColor: `${getColor(score)}30`, color: getColor(score) }}
            >
                <span className="text-sm font-bold uppercase tracking-wide">{getVerdict(score)}</span>
            </motion.div>
        </div>
    );
};

export default SafetyIndexMeter;
