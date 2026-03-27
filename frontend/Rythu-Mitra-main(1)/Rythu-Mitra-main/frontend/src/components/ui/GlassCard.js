import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay, ease: [0.4, 0, 0.2, 1] }}
            className={`relative overflow-hidden rounded-[24px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl ${className}`}
            style={{
                boxShadow: "var(--glass-shadow)",
            }}
        >
            <div className="relative z-10">{children}</div>

            {/* Subtle shine effect on hover could go here */}
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        </motion.div>
    );
}
