import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ScoreRing = ({ score }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    const fullCircumference = 2 * Math.PI * 52; // r=52
    const strokeDashoffset = fullCircumference - (Math.min(score, 10) / 10) * fullCircumference;

    let color = '#22c55e'; // Green
    let textColor = 'text-green-600';
    let label = 'Excellent';

    if (score < 4) {
        color = '#ef4444'; // Red
        textColor = 'text-red-600';
        label = 'Poor';
    } else if (score < 7) {
        color = '#eab308'; // Yellow
        textColor = 'text-yellow-600';
        label = 'Fair';
    } else if (score < 9) {
        color = '#84cc16'; // Lime/Light Green
        textColor = 'text-lime-600'; // Adjusted to match
        label = 'Good';
    }

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const stepTime = Math.abs(Math.floor(duration / (score * 10)));
        if (score === 0) return;

        // Simple counter effect
        const timer = setInterval(() => {
            start += 0.1;
            setAnimatedScore(prev => {
                if (prev >= score) {
                    clearInterval(timer);
                    return score;
                }
                return Number((prev + 0.1).toFixed(1));
            });
        }, 15); // Fast updates

        return () => clearInterval(timer);
    }, [score]);

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="96"
                    cy="96"
                    r="52"
                    stroke="#f3f4f6"
                    strokeWidth="12"
                    fill="transparent"
                />
                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: fullCircumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="96"
                    cy="96"
                    r="52"
                    stroke={color}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={fullCircumference}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-5xl font-bold tracking-tighter ${textColor}`}>
                    {score}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">
                    Safety Score
                </span>
                <span className={`text-sm font-medium mt-1 px-3 py-0.5 rounded-full bg-gray-100 ${textColor}`}>
                    {label}
                </span>
            </div>
        </div>
    );
};

export default ScoreRing;
