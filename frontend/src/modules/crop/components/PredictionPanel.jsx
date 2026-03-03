import React from 'react';
import { motion } from 'framer-motion';

export default function PredictionPanel({ data }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <span className="text-6xl">🌾</span>
            </div>

            <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Optimal Crop Identified</span>
                <h2 className="text-3xl font-black text-white mb-2">{data.prediction}</h2>
                <div className="flex items-center gap-3">
                    <span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {data.confidence}% Confidence
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                        Forecast: {data.yield_forecast}
                    </span>
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Nitrogen Level</span>
                    <span className="text-emerald-400 font-mono">{data.explanation.nitrogen}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Soil Match</span>
                    <span className="text-emerald-400 font-mono">{data.explanation.soil}</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }} animate={{ width: `${data.confidence}%` }}
                        className="h-full bg-emerald-500"
                    />
                </div>
            </div>
        </motion.div>
    );
}
