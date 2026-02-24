import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Sparkles, Sprout, ShieldCheck, Heart, Info, ArrowDownRight } from 'lucide-react';

const AlternativeCard = ({ product, scannedRiskScore, scannedProductStringified }) => {
    const navigate = useNavigate();

    const FALLBACK_IMAGE = "/images/product-placeholder.png";

    // Smart Description Generator Fallback
    const generateDescription = () => {
        if (product.description) return product.description;

        let comparativeText = '';
        if (scannedRiskScore && product.riskScore < scannedRiskScore) {
            const diff = scannedRiskScore - product.riskScore;
            comparativeText = `A significantly safer choice (${diff} pts lower risk). `;
        }
        return `${comparativeText}A cleaner alternative within the ${product.subcategory || 'same'} segment.`;
    };

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'text-green-700 bg-green-50 border-green-200';
            case 'high': return 'text-red-700 bg-red-50 border-red-200';
            case 'moderate':
            default: return 'text-amber-700 bg-amber-50 border-amber-200';
        }
    };

    return (
        <div
            onClick={() => {
                navigate(`/product/${product._id}`, {
                    state: { scannedProduct: scannedProductStringified }
                })
            }}
            className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col relative group cursor-pointer"
        >
            {/* Soft green glow background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>

            <div className="h-56 w-full bg-gray-50/80 relative overflow-hidden flex-shrink-0 z-10">
                {/* Dynamically loaded product image */}
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = FALLBACK_IMAGE;
                    }}
                />

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-extrabold text-gray-800 shadow-sm border border-gray-100 flex items-center gap-2 z-30">
                    <div className={`w-2 h-2 rounded-full ${product.riskLevel === 'high' ? 'bg-red-500' : product.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
                    {product.riskScore} Risk
                </div>
                {product.cleanLabel && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[10px] font-bold text-green-600 shadow-sm border border-green-100 uppercase tracking-widest z-30 flex items-center gap-1">
                        <Sprout size={12} /> Clean Label
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1 relative z-10 bg-transparent">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{product.brand || 'Generic Brand'}</span>
                {scannedRiskScore && (scannedRiskScore - product.riskScore > 0) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200 mb-2 w-max">
                        <ArrowDownRight size={12} /> {scannedRiskScore - product.riskScore} Pts Lower Risk
                    </span>
                )}
                <h4 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-brand-700 transition-colors">{product.name}</h4>
                <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3 leading-relaxed">
                    {generateDescription()}
                </p>

                {/* Dietary Tags */}
                {product.dietaryTags && product.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {product.dietaryTags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-50/50 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">
                                <ShieldCheck size={10} className="text-brand-500" />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="pt-5 border-t border-gray-100/80 mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Assessed Risk</span>
                        <span className="text-gray-900 font-extrabold text-lg capitalize">{product.riskLevel || 'Unknown'}</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border capitalize ${getRiskColor(product.riskLevel)}`}>
                        {product.riskScore} Pts
                    </span>
                </div>
            </div>
        </div >
    );
};

export default AlternativeCard;
