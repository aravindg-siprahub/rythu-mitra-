import React from "react";
import AWSCard from "../ui/AWSCard";

const aiFeatures = [
    { name: "AI Crop Advisor", bg: "bg-green-50" },
    { name: "AI Disease Analyst", bg: "bg-red-50" },
    { name: "AI Market Predictor", bg: "bg-blue-50" },
    { name: "AI Weather Engine", bg: "bg-cyan-50" },
];

export default function AISection() {
    return (
        <div className="py-12 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-gradient-to-b from-[#0073BB] to-[#55FF6A]"></div>
                <h2 className="text-2xl font-bold text-[#232F3E]">Powered by Neural Engine</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {aiFeatures.map((f, i) => (
                    <AWSCard key={i} className={`p-4 flex items-center gap-4 group hover:bg-[#232F3E] transition-colors`}>
                        <div className={`h-12 w-12 rounded-lg ${f.bg} flex items-center justify-center text-xl group-hover:bg-white/10`}>
                            🤖
                        </div>
                        <div>
                            <h4 className="font-bold text-[#232F3E] group-hover:text-white">{f.name}</h4>
                            <p className="text-xs text-slate-500 group-hover:text-slate-400">Version 3.1.0</p>
                        </div>
                    </AWSCard>
                ))}
            </div>
        </div>
    );
}
