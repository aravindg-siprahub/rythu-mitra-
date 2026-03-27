import React from "react";
import { motion } from "framer-motion";
import { ANIMATIONS } from "../../utils/animations";

export default function PageShell({ children, className = "" }) {
    return (
        <div className="relative min-h-screen bg-[#00030A] overflow-hidden">
            {/* 1. Holographic Grid Layer */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-grid-holo" />

            {/* 2. Cinematic Gradient Arc Light */}
            <div className="absolute top-[-20%] left-[-10%] h-[1000px] w-[1000px] rounded-full bg-gradient-to-br from-blue-600/10 via-pink-600/5 to-purple-600/10 blur-[180px] animate-pulse pointer-events-none" />

            {/* 3. Neural Lines Layer */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="neural-line"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${8 + Math.random() * 7}s`
                        }}
                    />
                ))}
            </div>

            {/* 4. Micro-particles Layer (Canvas or CSS fallback) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 0.2, 0],
                            scale: [0, 1.5, 0],
                            y: [0, -200 - Math.random() * 500]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                        className="absolute h-1 w-1 bg-white rounded-full"
                        style={{
                            bottom: "-10px",
                            left: `${Math.random() * 100}%`
                        }}
                    />
                ))}
            </div>

            {/* 5. Content Layer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-12 max-w-[1700px] mx-auto ${className}`}
            >
                {children}
            </motion.div>
        </div>
    );
}
