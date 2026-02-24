import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, Package, LogOut, TrendingUp, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // In a real app we would fetch these from an admin-only endpoint
    // For now we'll mock the data structure to match the UI requirements
    const [stats, setStats] = useState({
        totalUsers: 142,
        totalScans: 8943,
        totalReports: 12,
        activeProducts: 520
    });

    const [reports, setReports] = useState([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);

    const token = localStorage.getItem('token');

    const fetchReports = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/reports/admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReports(res.data.reports);
            }
        } catch (error) {
            console.error("Admin fetch reports Error:", error);
        } finally {
            setIsLoadingReports(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [token]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/reports/admin/${id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReports(reports.map(r => r._id === id ? { ...r, status: newStatus } : r));
            }
        } catch (error) {
            console.error("Update report status Error:", error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarItem = ({ icon, label, active }) => (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${active ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            {icon} {label}
        </button>
    );

    const StatCard = ({ title, value, icon, gradient }) => (
        <motion.div whileHover={{ y: -4 }} className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-[24px] text-white shadow-sm border border-white/20`}>
            <div className="absolute -right-4 -bottom-4 opacity-20 transform scale-150">
                {icon}
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <span className="text-white/80 font-bold uppercase tracking-widest text-xs mb-4">{title}</span>
                <span className="text-4xl font-black">{value}</span>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Admin Sidebar */}
            <div className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col h-screen sticky top-0">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-gray-900 p-2 rounded-xl text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h2 className="font-black text-gray-900 leading-tight tracking-tight">LabelLens.AI</h2>
                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Admin Portal</span>
                    </div>
                </div>

                <div className="flex-1 space-y-1.5">
                    <SidebarItem active icon={<LayoutDashboard size={18} />} label="Overview" />
                    <SidebarItem icon={<Users size={18} />} label="View All Users" />
                    <SidebarItem icon={<AlertTriangle size={18} />} label="View Reports" />
                    <SidebarItem icon={<Package size={18} />} label="View Products" />
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={18} /> Secure Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto w-full">

                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-1">System Overview</h1>
                        <p className="text-gray-500 font-medium">Global analytics and active moderation queue.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                            <UserCheck size={16} />
                        </div>
                        <span className="font-bold text-sm text-gray-700">Superadmin Session</span>
                    </div>
                </header>

                {/* Top Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title="Total Users" value={stats.totalUsers} icon={<Users size={64} />} gradient="from-blue-500 to-blue-600" />
                    <StatCard title="Total Scans" value={stats.totalScans.toLocaleString()} icon={<TrendingUp size={64} />} gradient="from-brand-500 to-brand-600" />
                    <StatCard title="Active Reports" value={stats.totalReports} icon={<AlertTriangle size={64} />} gradient="from-yellow-500 to-orange-500" />
                    <StatCard title="Indexed Products" value={stats.activeProducts} icon={<Package size={64} />} gradient="from-purple-500 to-purple-600" />
                </div>

                {/* Recent Reports Table Area */}
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-extrabold text-gray-900">Recent Accuracy Reports</h3>
                        <button className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors">View All Queue &rarr;</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Reported Product</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Reason Flagged</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Reported By</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 rounded-tr-xl text-right whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            {isLoadingReports ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">Loading reports...</td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">No reports found.</td>
                                </tr>
                            ) : (
                                reports.map(report => (
                                    <tr key={report._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{report.productName}</div>
                                            <div className="text-xs text-brand-600 font-bold tracking-wider">{report.category}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-600 max-w-xs">{report.complaintText || report.reason}</td>
                                        <td className="px-6 py-4 font-medium text-gray-400">{report.userEmail || report.userId}</td>
                                        <td className="px-6 py-4 font-medium text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report._id, e.target.value)}
                                                className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer ${report.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-2 focus:ring-yellow-200' :
                                                        report.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-2 focus:ring-green-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-200 focus:ring-2 focus:ring-blue-200'
                                                    }`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Under Review">Under Review</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
