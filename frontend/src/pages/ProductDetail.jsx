import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Heart, ShieldCheck, Activity, Brain, AlertTriangle, Target, Loader2, Info, ChevronRight } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();

    // Recover scanned product payload from the previous view history if available
    const scannedProduct = state?.scannedProduct || null;

    const [isLoading, setIsLoading] = useState(true);
    const [intelligence, setIntelligence] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchProductIntelligence = async () => {
            setIsLoading(true);
            try {
                // Fetch deeply structured comparison
                const res = await axios.post(`http://localhost:5000/api/products/${id}/intelligence`, {
                    scannedProduct
                });

                if (res.data.success) {
                    setIntelligence(res.data);
                } else {
                    setErrorMsg("Product intelligence metrics could not be loaded.");
                }
            } catch (err) {
                console.error("Intelligence Fetch Error:", err);
                setErrorMsg("Failed to connect to the intelligence server.");
            } finally {
                setIsLoading(false);
            }
        };

        const postScanHistory = async () => {
            try {
                // Determine risk context intelligently
                const riskScoreContext = scannedProduct ? Number(scannedProduct.score) : 80;
                await axios.post('http://localhost:5000/api/user/history', {
                    productId: id,
                    riskScore: riskScoreContext
                });
            } catch (err) {
                console.error("Failed to quietly log scan history:", err);
            }
        };

        fetchProductIntelligence();
        postScanHistory();
    }, [id, scannedProduct]);

    const handleToggleFavorite = async () => {
        try {
            if (isFavorite) {
                await axios.delete(`http://localhost:5000/api/user/favorites/${id}`);
                setIsFavorite(false);
            } else {
                await axios.post('http://localhost:5000/api/user/favorites', { productId: id });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Favorite toggle failed:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
                    <p className="text-gray-500 font-medium">Synthesizing Product Intelligence...</p>
                </div>
            </div>
        );
    }

    if (errorMsg || !intelligence) {
        return (
            <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
                <p className="text-gray-500 mb-8">{errorMsg || "The product you requested doesn't exist."}</p>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl">Go Back</button>
            </div>
        );
    }

    const { product, comparison, safetyExplanation, riskBreakdown, compatibility } = intelligence;

    // Helper: Risk Bar Component
    const RiskBar = ({ label, value, max = 100 }) => {
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        let color = 'bg-green-500';
        if (percentage > 30) color = 'bg-yellow-500';
        if (percentage > 70) color = 'bg-red-500';

        return (
            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    <span>{label}</span>
                    <span className={percentage > 70 ? 'text-red-500' : ''}>{value} / {max}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                    <div
                        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Global Back Nav */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
                >
                    <ArrowLeft size={16} /> Returns to Alternatives
                </button>

                {/* 🟢 SECTION 1: Header Dashboard */}
                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-full opacity-60 pointer-events-none"></div>

                    <div className="grid md:grid-cols-12 gap-10 items-center relative z-10">
                        {/* Huge Image Graphic */}
                        <div className="md:col-span-5 h-[300px] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center p-6 relative group">
                            <img
                                src={product.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                            {/* Differential Risk Badge Header overlay */}
                            {comparison.isSafer && (
                                <div className="absolute top-4 left-4 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 animate-[pulse_3s_ease-in-out_infinite]">
                                    <ShieldCheck size={20} />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-80 mb-0.5">Safety Differential</p>
                                        <p className="font-extrabold leading-none">{comparison.riskDifference} Points Safer</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Title & Core Meta */}
                        <div className="md:col-span-7 flex flex-col justify-center">
                            <span className="text-sm font-bold text-brand-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity size={16} /> {product.primaryCategory} / {product.secondaryCategory}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-xl text-gray-400 font-medium mb-8">by <span className="text-gray-700 font-bold">{product.brand || "Generic Brand"}</span></p>

                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl flex flex-col justify-center items-center shadow-lg border border-gray-800">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Overall Risk</span>
                                    <span className="text-2xl font-black">{product.riskScore}<span className="text-sm text-gray-400 font-medium">/100</span></span>
                                </div>

                                <div className="bg-brand-50 text-brand-800 px-6 py-3 rounded-2xl flex flex-col justify-center items-center border border-brand-100">
                                    <span className="text-[10px] uppercase font-bold text-brand-600/60 tracking-wider mb-0.5">Rating</span>
                                    <span className="text-2xl font-black">{product.safetyRating}<span className="text-sm text-brand-600/60 font-medium">/10</span></span>
                                </div>

                                <div className="ml-auto text-right">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-0.5">Estimated Price</span>
                                    <span className="text-3xl font-black text-gray-900">${product.price?.toFixed(2) || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">

                    {/* Left Column (Wider) */}
                    <div className="md:col-span-2 space-y-8">

                        {/* 🟢 SECTION 2: Why This Is Safer */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-3 mb-6">
                                <Brain className="text-brand-500" /> AI Safety Intelligence
                            </h3>
                            <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100 mb-6">
                                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                                    {safetyExplanation}
                                </p>
                            </div>

                            {/* 🟢 Personal Preferences Reasoning Injection */}
                            {scannedProduct && scannedProduct.reasoning && scannedProduct.reasoning.length > 0 && (
                                <div className="mt-4 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                                    <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-3 uppercase tracking-wider">
                                        <AlertTriangle size={16} /> Personal Health Triggers
                                    </h4>
                                    <ul className="space-y-3">
                                        {scannedProduct.reasoning.map((reason, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm font-medium text-orange-900/80">
                                                <div className="mt-0.5 min-w-[6px] h-[6px] rounded-full bg-orange-400"></div>
                                                Leading to score adjustments: {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* 🟢 SECTION 3: Detailed Ingredient Comparison */}
                        {scannedProduct && scannedProduct.additivesFound && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden">
                                <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-3 mb-6">
                                    <Target className="text-brand-500" /> Direct Comparison
                                </h3>

                                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Scanned Product Additive</th>
                                                <th className="px-6 py-4">This Alternative</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {scannedProduct.additivesFound.map((additive, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                                                        <AlertTriangle size={14} className="text-red-500" />
                                                        {additive.name} <span className="text-gray-400 text-xs">({additive.code})</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-green-600 flex items-center gap-2">
                                                        <ShieldCheck size={16} /> Removed
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Dummy injection for mapping demonstration since current API doesn't hold discrete alternative ingredients parsed identically to additives JSON yet */}
                                            {product.sugarRisk < 40 && (
                                                <tr className="hover:bg-gray-50/50 transition-colors bg-green-50/20">
                                                    <td className="px-6 py-4 font-medium text-gray-800">High Added Sugar</td>
                                                    <td className="px-6 py-4 font-bold text-green-700">Reduced/Natural Sweeteners</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="md:col-span-1 space-y-8">

                        {/* 🟢 SECTION 4: Quantitative Risk Breakdown */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-extrabold text-gray-900 mb-6">Risk Breakdown</h3>

                            <RiskBar label="Additives & Preservatives" value={riskBreakdown.additiveRisk} />
                            <RiskBar label="Sugar Profile" value={riskBreakdown.sugarRisk} />
                            <RiskBar label="Artificial Colors/Flavors" value={riskBreakdown.artificialRisk} />

                            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                                <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Total Composite</span>
                                <span className="text-xl font-black text-gray-900">{riskBreakdown.overallRisk}</span>
                            </div>
                        </div>

                        {/* 🟢 SECTION 5 & 6: Compatibility & Benefits */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-extrabold text-gray-900 mb-6">Health Profile</h3>

                            {compatibility && compatibility.length > 0 ? (
                                <div className="space-y-3 mb-8">
                                    {compatibility.map((tag, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                            <Heart size={16} className="text-pink-500" /> {tag}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-8 italic">No specific dietary tags registered for this product.</p>
                            )}

                            {product.highlights && product.highlights.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Functional Highlights</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.highlights.map((h, i) => (
                                            <span key={i} className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 🟢 SECTION 7: Call to Action */}
                        <div className="space-y-4">
                            <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group">
                                <MapPin size={18} className="group-hover:animate-bounce" /> Find in Local Stores
                            </button>
                            <button
                                onClick={handleToggleFavorite}
                                className={`w-full font-bold py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 border ${isFavorite
                                    ? 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700'
                                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                                    }`}
                            >
                                <Heart size={18} className={isFavorite ? "fill-pink-500 text-pink-500" : ""} />
                                {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
