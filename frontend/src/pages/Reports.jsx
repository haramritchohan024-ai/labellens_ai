import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Clock, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';

const Reports = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/user/reports');
                if (res.data.success) {
                    setReports(res.data.reports);
                }
            } catch (error) {
                console.error("Reports fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
        );
    }

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'Pending':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200"><Clock size={12} /> Pending</span>;
            case 'Under Review':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><AlertTriangle size={12} /> Reviewing</span>;
            case 'Resolved':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200"><CheckCircle size={12} /> Resolved</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                            <ShieldAlert className="text-yellow-500" /> My Reports
                        </h1>
                        <p className="text-gray-500 font-medium">Track products you've flagged for inaccurate ingredients or unsafe profiles.</p>
                    </div>
                </div>

                {reports.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Reason Flagged</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reports.map((report) => (
                                    <tr key={report._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center p-1 border border-gray-100">
                                                    <img src={report.productId?.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100"} alt="product" className="h-full w-full object-contain mix-blend-multiply" />
                                                </div>
                                                <span className="font-bold text-gray-900">{report.productId?.name || "Unknown Product"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-600 max-w-xs truncate">{report.complaintText || report.reason}</td>
                                        <td className="px-6 py-4 text-gray-400 font-medium">{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <StatusBadge status={report.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="pt-20 text-center flex flex-col items-center">
                        <div className="bg-yellow-50 p-6 rounded-full inline-block mb-6">
                            <ShieldAlert className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reports Submitted</h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                            If you find a product with highly suspicious or undocumented ingredients, report it and track its status here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
