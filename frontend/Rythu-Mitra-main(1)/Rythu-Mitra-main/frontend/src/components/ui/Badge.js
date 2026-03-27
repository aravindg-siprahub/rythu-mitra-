import React from "react";

const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-slate-800 text-slate-400 border-slate-700",
};

export default function Badge({
    children,
    variant = "info",
    className = "",
    pulse = false
}) {
    return (
        <span className={`
      inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-md
      ${variants[variant]}
      ${className}
    `}>
            {/* Pulse Dot */}
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${variant === 'success' ? 'bg-emerald-400' :
                            variant === 'warning' ? 'bg-amber-400' :
                                variant === 'error' ? 'bg-red-400' : 'bg-blue-400'
                        }`}></span>
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${variant === 'success' ? 'bg-emerald-500' :
                            variant === 'warning' ? 'bg-amber-500' :
                                variant === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></span>
                </span>
            )}

            {children}
        </span>
    );
}
