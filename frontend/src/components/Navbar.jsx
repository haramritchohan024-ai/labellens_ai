import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scan, Moon, Sun, Menu, LogIn, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const Navbar = () => {
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navLinkClass = (path) => `
        relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
        ${location.pathname === path
            ? 'text-brand-800 dark:text-brand-300 bg-white/60 dark:bg-white/10 shadow-[0_0_15px_rgba(34,197,94,0.4)] ring-1 ring-brand-300 dark:ring-brand-500 backdrop-blur-md'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10'}
    `;

    return (
        <nav className="fixed top-0 w-full z-50">
            {/* Liquid glass background */}
            <div className="absolute inset-0 bg-white/10 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/10 dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300 z-0"></div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-30">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2.5 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-all shadow-sm"
                            aria-label="Open Sidebar"
                        >
                            <Menu size={22} />
                        </button>

                        <Link to="/" className="flex items-center gap-3 group">
                            {/* Improved logo with subtle glow */}
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-accent-light rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative bg-gradient-to-tr from-brand-500 to-accent-dark w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-[1.02] transition-transform duration-300">
                                    <Scan size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 dark:from-white via-gray-700 dark:via-gray-300 to-gray-900 dark:to-white tracking-tight transition-colors duration-300">
                                LabelLens<span className="text-brand-500">.AI</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-1 bg-white/30 dark:bg-black/20 backdrop-blur-lg border border-white/50 dark:border-white/10 rounded-full p-1.5 shadow-sm transition-colors duration-300">
                        <Link to="/" className={navLinkClass('/')}>Home</Link>
                        <Link to="/scan" className={navLinkClass('/scan')}>
                            Scan
                            {location.pathname === '/scan' && (
                                <span className="absolute inset-0 rounded-full border-2 border-brand-300 dark:border-brand-500 shadow-[inset_0_0_15px_rgba(34,197,94,0.2)]"></span>
                            )}
                        </Link>
                        <Link to="/history" className={navLinkClass('/history')}>History</Link>
                        <Link to="/about" className={navLinkClass('/about')}>About</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle placeholder */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white/50 dark:hover:bg-white/10 transition-all shadow-sm duration-300"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Auth Button */}
                        {user ? (
                            <div className="flex flex-col text-right hidden lg:block mr-2 text-sm font-bold text-gray-900 border-l border-gray-200 pl-4 ml-2">
                                <span className="block truncate max-w-[120px]">{user.name}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{user.role}</span>
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5 ml-2">
                                <LogIn size={16} /> Sign In
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </nav >
    );
};

export default Navbar;
