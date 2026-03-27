import React from "react";
import { motion } from "framer-motion";

export default function PremiumButton({ children, onClick, variant = "primary", className = "", icon = null }) {
    const isPrimary = variant === "primary";

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
        relative flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-[15px] font-semibold tracking-wide transition-all duration-300
        ${isPrimary
                    ? "bg-[var(--brand-primary)] text-[var(--bg-primary)] shadow-lg hover:shadow-xl"
                    : "bg-[var(--glass-bg)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-[var(--bg-secondary)]"
                }
        ${className}
      `}
        >
            {/* Button Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
                {icon && <span className="text-lg">{icon}</span>}
            </span>

            {/* Glow Effect for Primary */}
            {isPrimary && (
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 hover:animate-shimmer" />
            )}
        </motion.button>
    );
}
