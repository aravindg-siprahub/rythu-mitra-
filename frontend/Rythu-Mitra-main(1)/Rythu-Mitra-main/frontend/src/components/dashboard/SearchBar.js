import React from "react";

export default function SearchBar() {
    return (
        <div className="relative group w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-slate-400 text-lg">🔍</span>
            </div>
            <input
                type="text"
                placeholder="Search services, products, docs (e.g., 'Soil Analysis')"
                className="w-full h-10 pl-11 pr-4 rounded-full bg-slate-100 border border-transparent text-slate-700 text-sm focus:bg-white focus:border-[#0073BB] focus:ring-2 focus:ring-[#0073BB]/20 focus:outline-none transition-all placeholder:text-slate-500"
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
                <span className="text-xs text-slate-400 border border-slate-300 rounded px-1.5 py-0.5">/</span>
            </div>
        </div>
    );
}
