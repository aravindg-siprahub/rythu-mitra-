import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
    { icon: '📊', label: 'Command Center', path: '/dashboard' },
    { icon: '🤖', label: 'AI Operations', path: '/crop' },
    { icon: '🔬', label: 'Disease Lab', path: '/disease' },
    { icon: '📈', label: 'Market Intel', path: '/market' },
    { icon: '☁️', label: 'Weather Grid', path: '/weather' },
    { icon: '🚚', label: 'Logistics Net', path: '/transport' },
    { icon: '👷', label: 'Workforce', path: '/workers' },
    { icon: '🛡️', label: 'Admin Audit', path: '/settings' },
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    return (
        <motion.aside
            initial={{ width: 80 }}
            animate={{ width: isOpen ? 260 : 80 }}
            className="hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 bg-[#050B14] z-50 transition-all duration-300"
        >
            {/* Brand Area */}
            <div className="h-20 flex items-center justify-center border-b border-white/5 relative">
                <div className="flex items-center gap-3 overflow-hidden w-full px-6">
                    <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <span className="text-lg font-bold">R</span>
                    </div>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-nowrap"
                            >
                                <h1 className="font-black text-sm text-white uppercase tracking-widest">Rythu Mitra</h1>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#050B14] border border-white/20 text-slate-500 hover:text-white hover:border-emerald-500 transition-colors flex items-center justify-center text-[10px]"
                >
                    {isOpen ? '◀' : '▶'}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path}>
                            <div
                                className={`flex items-center gap-4 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 group
                                    ${isActive ? 'bg-white/5 text-emerald-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <span className={`text-xl w-6 text-center ${isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`}>
                                    {item.icon}
                                </span>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="font-medium text-xs uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {isActive && isOpen && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Role */}
            <div className="p-4 border-t border-white/5">
                <div className={`flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 ${!isOpen && 'justify-center'}`}>
                    <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex-shrink-0 border border-white/10" />

                    {isOpen && (
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white">Aravind Dev</p>
                            <p className="text-[10px] text-emerald-500 font-mono border border-emerald-500/20 bg-emerald-500/10 px-1 rounded inline-block mt-1">
                                SYS_ADMIN
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
