import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Loader } from 'lucide-react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/history');
                setHistory(res.data);
            } catch (error) {
                console.error('Failed to load history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Prepare chart data (reverse to show chronological logic if needed, or by index)
    const chartData = history.slice().reverse().map((item, index) => ({
        name: `Scan ${index + 1}`,
        score: item.safetyScore,
        date: new Date(item.createdAt).toLocaleDateString()
    }));

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader className="animate-spin text-green-600" size={40} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <Clock className="mr-3" /> Scan History
            </h1>

            {/* Chart Section */}
            {history.length > 1 && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Safety Score Trend</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis dataKey="date" hide />
                                <YAxis domain={[0, 10]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* List Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {history.length === 0 ? (
                        <li className="p-8 text-center text-gray-500">No scans yet. Go scan something!</li>
                    ) : (
                        history.map((item) => (
                            <li key={item._id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 truncate max-w-md">
                                            {item.detectedAdditives.length > 0
                                                ? `Found: ${item.detectedAdditives.map(a => a.name).join(', ')}`
                                                : 'No additives detected'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`
                                        flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg text-white
                                        ${item.safetyScore >= 8 ? 'bg-green-500' : item.safetyScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}
                                    `}>
                                        {item.safetyScore?.toFixed(0) || '-'}
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default History;
