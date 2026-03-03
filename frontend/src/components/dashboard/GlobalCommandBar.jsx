import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const GlobalCommandBar = () => {
    const [scrolled, setScrolled] = useState(false);

    // Context State (Simulated)
    const [context] = useState({
        region: 'AP-South-1',
        time: 'LIVE',
        user: 'Aravind'
    });

    useEffect(() => {
        const updateScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', updateScroll);
        return () => window.removeEventListener('scroll', updateScroll);
    }, []);

    const navLinks = [
        { name: 'Overview', path: '/dashboard' },
        { name: 'Crops', path: '/crop' },
        { name: 'Disease', path: '/disease' },
        { name: 'Market', path: '/market' },
        { name: 'Weather', path: '/weather' },
        { name: 'Logistics', path: '/transport' },
        { name: 'Workforce', path: '/workers' },
    ];

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 h-[64px] z-50 transition-all duration-300 flex items-center justify-between px-6 border-b ${scrolled
                    ? 'bg-black/60 backdrop-blur-2xl border-white/5 shadow-2xl'
                    : 'bg-transparent border-white/5'
                }`}
        >
            {/* 1. Identity */}
            <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-emerald-900/20">
                    RM
                </div>
                <span className="font-semibold text-sm tracking-tight text-white/90 font-display">
                    Rythu Mitra <span className="opacity-50 font-light">OS</span>
                </span>
            </div>

            {/* 2. Primary Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        to={link.path}
                        className="px-3 py-1.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>

            {/* 3. Global Command (Centered) */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm hidden md:block">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search Intelligence..."
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 focus:border-white/10 rounded-full py-1.5 pl-9 pr-12 text-xs text-white placeholder:text-white/20 transition-all outline-none font-medium backdrop-blur-md"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-white/5 bg-white/5 text-[9px] font-mono text-white/30">⌘K</kbd>
                    </div>
                </div>
            </div>

            {/* 4. Context & System */}
            <div className="flex items-center gap-4 min-w-[200px] justify-end">
                {/* Context Pills */}
                <div className="hidden lg:flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Region</span>
                        <span className="text-[11px] font-mono text-slate-300">{context.region}</span>
                    </div>
                    <div className="w-px h-6 bg-white/5 mx-2" />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Time</span>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400">{context.time}</span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full border border-black"></span>
                </button>

                {/* User */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-[10px] text-white font-medium shadow-inner cursor-pointer hover:border-white/20 transition-all">
                    A
                </div>
            </div>
        </motion.header>
    );
};

export default GlobalCommandBar;
