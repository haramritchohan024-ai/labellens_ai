import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Heart, History, AlertTriangle, Activity, Settings, LogOut, Sprout, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    // Nav Items Configuration
    const navItems = [
        { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
        { path: '/favorites', label: 'Favorites', icon: <Heart size={20} /> },
        { path: '/history', label: 'Scan History', icon: <History size={20} /> },
        { path: '/reports', label: 'Reported Products', icon: <AlertTriangle size={20} /> },
        { path: '/preferences', label: 'Preferences', icon: <Settings size={20} /> },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark Overlay Dimmer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity cursor-pointer"
                    />

                    {/* Animated Slide-out Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-full w-72 bg-white flex flex-col z-50 shadow-2xl border-r border-gray-100 overflow-y-auto"
                    >
                        {/* Header logo area */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <span className="bg-brand-500 text-white p-1.5 rounded-lg shadow-sm">
                                    <Sprout size={20} />
                                </span>
                                <span className="text-xl font-black text-gray-900 tracking-tight">LabelLens<span className="text-brand-500">.AI</span></span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation Links Area */}
                        <nav className="flex-1 px-4 py-8 space-y-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.label}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all
                                        ${isActive
                                            ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    {item.icon}
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User Profile / Logout Anchor */}
                        <div className="p-6 border-t border-gray-50 mt-auto">
                            {user ? (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-2xl mb-4 flex items-center gap-3 border border-gray-100">
                                        <div className="w-10 h-10 bg-brand-100 text-brand-700 font-black flex items-center justify-center rounded-xl uppercase">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-gray-900 truncate">{user.name}</span>
                                            <span className="text-xs font-semibold text-gray-400 capitalize truncate">{user.role} Account</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { logout(); onClose(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={20} />
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <NavLink
                                    to="/login"
                                    onClick={onClose}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold bg-gray-900 text-white hover:bg-black transition-colors shadow-lg"
                                >
                                    <LogIn size={20} />
                                    Sign In / Register
                                </NavLink>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
