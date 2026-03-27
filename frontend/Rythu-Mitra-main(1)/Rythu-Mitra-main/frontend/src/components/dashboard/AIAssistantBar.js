import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAI } from "../../context/AIContext";

export default function AIAssistantBar() {
    const [isBarOpen, setIsBarOpen] = useState(false);
    const navigate = useNavigate();
    const { toggleAI } = useAI();

    const actions = [
        { label: "Check Harvest", path: "/crop" },
        { label: "Storm Alert", path: "/weather" },
        { label: "Logistics Fleet", path: "/transport" },
    ];

    return (
        <div className="fixed bottom-6 md:bottom-12 transition-all duration-700 pointer-events-none w-full flex justify-center px-4 z-[60]" style={{ right: isBarOpen ? '0' : '0' }}>
            <motion.div
                layout
                className={`pointer-events-auto bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex items-center gap-6 overflow-hidden transition-all duration-700
                    ${isBarOpen ? "rounded-[3rem] p-4 pr-10 max-w-2xl" : "rounded-full w-20 h-20 p-0 justify-center cursor-pointer hover:scale-110 hover:border-blue-500/50"}
                `}
                onClick={() => {
                    if (!isBarOpen) {
                        setIsBarOpen(true);
                        toggleAI(true);
                    }
                }}
            >
                {/* AI Icon */}
                <div className={`relative flex-shrink-0 flex items-center justify-center transition-all duration-700
                    ${isBarOpen ? "h-16 w-16 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-500/40" : "h-full w-full bg-transparent"}
                `}>
                    <span className={`transition-all duration-700 ${isBarOpen ? "text-2xl" : "text-3xl"}`}>🤖</span>
                    {!isBarOpen && (
                        <div className="absolute inset-0 bg-blue-500/20 animate-ping rounded-full" />
                    )}
                </div>

                {/* Content */}
                <AnimatePresence>
                    {isBarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between w-full gap-8"
                        >
                            <div className="flex flex-col gap-1 min-w-[200px]">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Rythu Intelligence</h4>
                                <p className="text-xs text-white font-bold uppercase tracking-widest truncate max-w-xs">Neural Engine v2035 Active. Proceed?</p>
                            </div>

                            <div className="flex gap-3">
                                {actions.map((a, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(a.path);
                                        }}
                                        className="h-11 px-5 rounded-2xl bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
                                    >
                                        {a.label}
                                    </button>
                                ))}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsBarOpen(false);
                                        toggleAI(false);
                                    }}
                                    className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-500 hover:text-white transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
