import React from "react";

export default function Input({
    label,
    id,
    type = "text",
    placeholder = "",
    error = null,
    icon = null,
    className = "",
    ...props
}) {
    return (
        <div className={`group relative w-full ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400 group-focus-within:text-blue-400"
                >
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                {icon && (
                    <span className="absolute left-4 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        {icon}
                    </span>
                )}

                <input
                    id={id}
                    type={type}
                    className={`
            w-full rounded-xl border bg-slate-950/50 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20
            ${icon ? "pl-11 pr-4" : "px-4"}
            ${error
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-slate-800 focus:border-blue-500"
                        }
          `}
                    placeholder={placeholder}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}
