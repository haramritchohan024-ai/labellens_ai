import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Scan, History, Info } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const BottomNav = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 z-50 md:hidden pb-safe-area">
            <div className="flex justify-around items-center p-3">
                <NavItem to="/" icon={<Home size={22} />} label="Home" />
                <NavItem to="/scan" icon={<Scan size={22} />} label="Scan" />
                <NavItem to="/history" icon={<History size={22} />} label="History" />
                <NavItem to="/about" icon={<Info size={22} />} label="About" />
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300",
                isActive ? "text-green-600 bg-green-50 scale-105" : "text-gray-400 hover:text-gray-600"
            )
        }
    >
        <div className="mb-0.5">{icon}</div>
        <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </NavLink>
);

export default BottomNav;
