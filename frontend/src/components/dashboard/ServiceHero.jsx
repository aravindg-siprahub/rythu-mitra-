import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ServiceHero = () => {
    const [streamData, setStreamData] = useState([]);

    // Simulate Active Data Stream
    useEffect(() => {
        const interval = setInterval(() => {
            const newByte = Math.random().toString(36).substring(7);
            setStreamData(prev => [...prev.slice(-20), newByte]);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div id="overview" className="relative min-h-[70vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden border-b border-white/5">
            {/* 1. Active Data Visualization Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Horizontal Scanning Line */}
                <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
                />

                {/* Radial Pulse */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
                {/* 2. System Intelligence Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center gap-4 mb-8"
                >
                    <div className="flex items-center gap-3 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                            System Nominal • Stream Active
                        </span>
                    </div>
                </motion.div>

                {/* 3. Enterprise Optical Typography */}
                <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 tracking-tighter mb-8 leading-[0.85] select-none">
                    RYTHU MITRA <br />
                    <span className="text-white/10 text-5xl md:text-7xl font-mono tracking-widest opacity-50 relative top-[-0.2em]">OS v2.0</span>
                </h1>

                {/* 4. Active Stream Decoration */}
                <div className="h-6 overflow-hidden mb-12 flex justify-center">
                    <div className="flex gap-4 text-[10px] font-mono text-emerald-900/40 uppercase tracking-widest opacity-50 select-none">
                        {streamData.map((byte, i) => (
                            <span key={i} className="animate-pulse">0x{byte}</span>
                        ))}
                    </div>
                </div>

                {/* 5. Primary Actions (Glass Buttons) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex items-center justify-center gap-6"
                >
                    <button className="group relative px-10 py-4 rounded bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] overflow-hidden">
                        <span className="relative z-10">Initialize System</span>
                        <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                    </button>

                    <button className="px-10 py-4 rounded border border-white/10 hover:border-white/30 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-all backdrop-blur-sm bg-white/5">
                        Console Log [Protected]
                    </button>
                </motion.div>

            </div>

            {/* 6. Bottom Decorator */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
};

export default ServiceHero;
