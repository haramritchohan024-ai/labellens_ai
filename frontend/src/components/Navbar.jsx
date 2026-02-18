import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scan, History, Info, Home } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const navLinkClass = (path) => `
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${location.pathname === path
            ? 'bg-green-100 text-green-700 shadow-sm'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
    `;

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100/50 shadow-sm hidden md:block">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-green-400 to-teal-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200 group-hover:scale-105 transition-transform">
                            <Scan size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                            LabelLens<span className="text-green-600">.AI</span>
                        </span>
                    </Link>

                    <div className="flex items-center space-x-2 bg-white border border-gray-100 rounded-full p-1.5 shadow-sm">
                        <Link to="/" className={navLinkClass('/')}>Home</Link>
                        <Link to="/scan" className={navLinkClass('/scan')}>Scan</Link>
                        <Link to="/history" className={navLinkClass('/history')}>History</Link>
                        <Link to="/about" className={navLinkClass('/about')}>About</Link>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
