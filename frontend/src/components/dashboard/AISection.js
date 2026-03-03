import React from "react";
import GlassCard from "../ui/GlassCard";

const aiFeatures = [
    { name: "AI Crop Advisor", bg: "bg-emerald-500/20 text-emerald-400" },
    { name: "AI Disease Analyst", bg: "bg-red-500/20 text-red-400" },
    { name: "AI Market Predictor", bg: "bg-blue-500/20 text-blue-400" },
    { name: "AI Weather Engine", bg: "bg-cyan-500/20 text-cyan-400" },
];

export default function AISection() {
    return (
        <div className="py-12 border-t border-white/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">Powered by Neural Engine</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {aiFeatures.map((f, i) => (
                    <GlassCard key={i} className={`flex items-center gap-4 group hover:bg-white/10 transition-colors cursor-pointer`}>
                        <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center text-xl group-hover:bg-white/10 group-hover:text-white transition-all`}>
                            🤖
                        </div>
                        <div>
                            <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{f.name}</h4>
                            <p className="text-xs text-slate-500 group-hover:text-slate-400 font-mono tracking-wider">v3.1.0</p>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
