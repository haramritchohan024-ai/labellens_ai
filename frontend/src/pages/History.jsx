import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, ShieldCheck, Target, Loader2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HistoryCard from '../components/HistoryCard';

const ScanHistory = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/user/history');
                if (res.data.success) {
                    setHistory(res.data.history);
                }
            } catch (error) {
                console.error("History fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                            <HistoryIcon className="text-brand-500" /> Scan History
                        </h1>
                        <p className="text-gray-500 font-medium">A complete log of every product ingredient breakdown you've reviewed.</p>
                    </div>
                </div>

                {history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((item, index) => (
                            <HistoryCard
                                key={item._id}
                                item={item}
                                index={index}
                                onClick={() => navigate(`/history/${item._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="pt-20 text-center flex flex-col items-center">
                        <div className="bg-brand-50 p-6 rounded-full inline-block mb-6">
                            <HistoryIcon className="w-12 h-12 text-brand-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No History Recorded</h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                            It looks like you haven't run any diagnostic scans yet. Take a picture of an ingredient list to begin analyzing safety risks!
                        </p>
                        <button
                            onClick={() => navigate('/scan')}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-brand-500 hover:bg-brand-600 rounded-full shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_10px_25px_rgba(34,197,94,0.4)]"
                        >
                            <Navigation className="w-5 h-5 fill-current" />
                            Start Scanning Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanHistory;
