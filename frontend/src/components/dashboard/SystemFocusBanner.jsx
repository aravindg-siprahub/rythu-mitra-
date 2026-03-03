import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemFocusBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Simulate system intelligence trigger
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-[#020617] border-b border-white/5 overflow-hidden"
                >
                    <div className="max-w-5xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between px-4 py-3 rounded border border-amber-500/20 bg-amber-900/10 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="text-sm text-amber-100/90 font-light tracking-wide">
                                    <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px] mr-3 border-r border-amber-500/30 pr-3">System Intent</span>
                                    Elevated disease risk detected in Sector 4.
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors group">
                                Review Analysis
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SystemFocusBanner;
