import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ShieldCheck, Heart, ScanSearch, Target, AlertTriangle, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import AlternativeCard from '../components/AlternativeCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({
        analytics: { totalScans: 0, savedFavorites: 0, avgRisk: 0, highRiskCount: 0, underReviewCount: 0 },
        recentActivity: { scans: [], favorites: [] }
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/user/dashboard/analytics');
                if (res.data.success) {
                    setData(res.data);
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
        );
    }

    const { analytics, recentActivity } = data;

    // A helper card for the top row
    const MetricCard = ({ title, value, subtext, icon, colorClass }) => (
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorClass}`}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</p>
                {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">My Dashboard</h1>
                        <p className="text-gray-500 font-medium">Your personalized health and product intelligence overview.</p>
                    </div>
                    <button onClick={() => navigate('/scan')} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-full font-bold shadow-md transition-colors flex items-center gap-2">
                        <ScanSearch size={18} /> New Scan
                    </button>
                </div>

                {/* 🟢 SECTION 1: Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Scans"
                        value={analytics.totalScans}
                        icon={<ScanSearch size={24} className="text-blue-600" />}
                        colorClass="bg-blue-50"
                    />
                    <MetricCard
                        title="Saved Favorites"
                        value={analytics.savedFavorites}
                        icon={<Heart size={24} className="text-pink-600" />}
                        colorClass="bg-pink-50"
                    />
                    <MetricCard
                        title="Avg. Risk Score"
                        value={analytics.avgRisk}
                        subtext="Across all scans"
                        icon={<Activity size={24} className={analytics.avgRisk > 60 ? "text-red-600" : "text-brand-600"} />}
                        colorClass={analytics.avgRisk > 60 ? "bg-red-50" : "bg-brand-50"}
                    />
                    <MetricCard
                        title="Products Flagged"
                        value={analytics.highRiskCount}
                        subtext="Scored above 70 risk"
                        icon={<AlertTriangle size={24} className="text-yellow-600" />}
                        colorClass="bg-yellow-50"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8 pt-8">

                    {/* 🟢 SECTION 2: Recent Scans History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-gray-900 border-b-2 border-brand-500 pb-1">Recent Activity</h2>
                            <NavLink to="/history" className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center">
                                View Full History <ChevronRight size={16} />
                            </NavLink>
                        </div>

                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                            {recentActivity.scans.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {recentActivity.scans.map((scan, i) => (
                                        <div
                                            key={i}
                                            className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer"
                                            onClick={() => navigate(`/history/${scan._id}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center p-2">
                                                    <Activity className={`w-6 h-6 ${scan.riskLevel === 'high' ? 'text-red-500' : scan.riskLevel === 'moderate' ? 'text-yellow-500' : 'text-green-500'}`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors uppercase pr-4">{scan.category || "Uncategorized Scan"}</h4>
                                                    <p className="text-xs font-semibold text-gray-400 mt-0.5">{new Date(scan.scannedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right flex flex-col items-end">
                                                    <span className={`text-sm font-black ${scan.riskLevel === 'high' ? 'text-red-500' : scan.riskLevel === 'moderate' ? 'text-yellow-500' : 'text-green-500'}`}>
                                                        {scan.riskScore} Risk
                                                    </span>
                                                </div>
                                                <div className="text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors p-2 rounded-full">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <ScanSearch className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">No scans recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🟢 SECTION 3: Bookmarks/Favorites Preview */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-gray-900 border-b-2 border-brand-500 pb-1">Saved Items</h2>
                            <NavLink to="/favorites" className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center">
                                All <ChevronRight size={16} />
                            </NavLink>
                        </div>

                        <div className="flex flex-col gap-4">
                            {recentActivity.favorites.length > 0 ? (
                                recentActivity.favorites.map((product, i) => (
                                    <div key={i} className="transform scale-90 origin-top">
                                        <AlternativeCard product={product} />
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white p-8 rounded-[24px] border border-gray-100 text-center shadow-sm">
                                    <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm text-gray-400 font-medium">You haven't saved any safe alternatives yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
