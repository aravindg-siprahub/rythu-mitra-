import React from "react";
import { motion } from "framer-motion";

export default function GlowCard({ children, className = "", onClick }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`relative p-[1px] rounded-[24px] overflow-hidden group cursor-pointer ${className}`}
        >
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0073BB] via-[#55FF6A] to-[#0073BB] opacity-30 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_200%] animate-gradient-xy" />

            {/* Content Container */}
            <div className={`relative h-full w-full bg-slate-900 rounded-[23px] overflow-hidden ${className.includes('bg-') ? '' : 'bg-white'}`}>
                {children}
            </div>
        </motion.div>
    );
}
