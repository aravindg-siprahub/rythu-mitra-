import React from "react";
import { motion } from "framer-motion";

const variants = {
    primary: "bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 border border-transparent",
    secondary: "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 hover:border-slate-600",
    outline: "bg-transparent text-[var(--accent-blue)] border border-[var(--accent-blue)] hover:bg-blue-500/10",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50",
    gradient: "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg hover:shadow-violet-500/25 border-none",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    icon: "p-2",
};

export default function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    isLoading = false,
    icon = null,
    onClick,
    ...props
}) {
    return (
        <motion.button
            whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
            className={`
        relative inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-wide transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
            onClick={!disabled && !isLoading ? onClick : undefined}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Loading Spinner */}
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}

            {/* Icon (if provided & not loading) */}
            {!isLoading && icon && <span className="flex items-center justify-center">{icon}</span>}

            {/* Text */}
            <span className="relative z-10">{children}</span>

            {/* Glow Effect for Primary/Gradient */}
            {(variant === "primary" || variant === "gradient") && !disabled && (
                <div className="absolute inset-0 -z-0 rounded-lg bg-white/5 opacity-0 transition-opacity hover:opacity-100" />
            )}
        </motion.button>
    );
}
