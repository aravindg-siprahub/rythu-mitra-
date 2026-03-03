import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Mock AI Data
const RECOMMENDATION = {
    crop: "Cotton (Bt-II)",
    confidence: 98.4,
    reasoning: [
        { factor: "Soil Nitrogen", status: "Optimal", impact: "+12% Yield" },
        { factor: "Market Forecast", status: "High Demand", impact: "+8% Price" },
        { factor: "Water Table", status: "Stable", impact: "Low Risk" }
    ],
    impactSimulation: {
        baseYield: "4.2 tons/acre",
        simulatedYield: "3.8 tons/acre", // if rain drops
    }
};

const CropAdvisorWidget = () => {
    const [showExplain, setShowExplain] = useState(false);
    const [simulating, setSimulating] = useState(false);

    return (
        <Card className="h-full flex flex-col relative overflow-hidden group bg-black/40 border-emerald-500/20">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <span className="text-emerald-500">🤖</span> AI Crop Advisor
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-1">
                        Neural Engine v4.2 • <span className="text-emerald-500">Online</span>
                    </p>
                </div>
                <div className="text-right">
                    <span className="block text-3xl font-black text-emerald-400">{RECOMMENDATION.confidence}%</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Confidence Score</span>
                </div>
            </div>

            {/* Main Recommendation */}
            <div className="mb-6 relative z-10">
                <div className="text-4xl font-black text-white mb-2 tracking-tight">
                    {RECOMMENDATION.crop}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                    Optimal planting window detected. Soil nitrogen levels indicate high compatibility.
                </p>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <Button
                        variant="primary"
                        onClick={() => setShowExplain(!showExplain)}
                        className="h-10 text-xs px-4"
                    >
                        {showExplain ? 'Hide Analysis' : 'Why this?'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setSimulating(!simulating)}
                        className={`h-10 text-xs px-4 ${simulating ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''}`}
                    >
                        {simulating ? 'Simulating Drought...' : 'Simulate Risk'}
                    </Button>
                </div>
            </div>

            {/* Explainability Panel */}
            <AnimatePresence>
                {showExplain && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white/5 rounded-xl border border-white/5 mb-4"
                    >
                        <div className="p-4 space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Decision Factors</h4>
                            {RECOMMENDATION.reasoning.map((r, i) => (
                                <div key={i} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                    <span className="text-slate-300">{r.factor}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-mono">{r.status}</span>
                                        <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400">{r.impact}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Simulation Result Overlay */}
            <AnimatePresence>
                {simulating && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 right-4 left-4 p-4 bg-amber-900/90 backdrop-blur-md rounded-xl border border-amber-500/30 shadow-2xl z-20"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">⚠️ Drought Simulation (-15% Rain)</span>
                            <button onClick={() => setSimulating(false)} className="text-amber-200 hover:text-white">✕</button>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] text-amber-200/60 uppercase">Projected Yield</div>
                                <div className="text-xl font-bold text-white">{RECOMMENDATION.impactSimulation.simulatedYield}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-amber-200/60 uppercase">Impact</div>
                                <div className="text-lg font-bold text-red-400">-9.5%</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Hologram */}
            <div className="absolute -right-20 top-20 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
        </Card>
    );
};

export default CropAdvisorWidget;
