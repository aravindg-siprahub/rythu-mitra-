import React from 'react';
import { motion } from 'framer-motion';

export default function AnalysisResult({ result, image }) {
    if (!result) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neo-panel backdrop-blur-md border border-neo-border rounded-2xl overflow-hidden"
        >
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image Preview */}
                <div className="relative h-64 md:h-auto bg-black">
                    <img src={image} alt="Analyzed" className="w-full h-full object-cover opacity-80" />

                    {/* Overlay Grid */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

                    {/* Bounding Box Simulation */}
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-red-500/80 rounded-lg animate-pulse">
                        <div className="absolute -top-3 -right-1 bg-red-500 text-black text-[9px] font-black px-1 rounded">
                            {result.confidence}%
                        </div>
                    </div>
                </div>

                {/* Report */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase text-red-500 tracking-widest border border-red-500/20 px-2 py-1 rounded">
                            pathogen_detected
                        </span>
                        <span className="text-xs font-mono text-slate-500">{result.latency_ms}ms</span>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">{result.disease_name}</h2>
                    <div className="flex gap-4 text-xs text-slate-400 mb-6 font-mono">
                        <span>Severity: <span className="text-white">{result.severity}</span></span>
                        <span>Area: <span className="text-white">{result.affected_area_pct}%</span></span>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-blue-400 uppercase">Recommended Treatment</h4>
                        <ul className="space-y-2">
                            {result.treatment.map((step, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-300">
                                    <span className="text-blue-500">➜</span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
