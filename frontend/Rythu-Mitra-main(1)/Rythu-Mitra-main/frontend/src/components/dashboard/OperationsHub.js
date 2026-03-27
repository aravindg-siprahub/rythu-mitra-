import React from "react";
import { motion } from "framer-motion";
import Card from "../ui/Card";
import Button from "../ui/Button";
import SimpleAreaChart from "../charts/SimpleAreaChart";
import { useAI } from "../../context/AIContext";

// Mock Live Data v2035
const diagnostics = [
    { label: "Soil Neural Connectivity", value: "98.4%", status: "optimal" },
    { label: "Bio-Synthetic Balance", value: "Perfect", status: "optimal" },
    { label: "Predictive Pest Risk", value: "0.02%", status: "optimal" },
    { label: "Atmospheric Moisture", value: "48.2%", status: "warning" },
];

export default function OperationsHub() {
    const { toggleAI, simulateResponse } = useAI();
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-10">

            {/* 1. MAIN HUD (Map/Status) - Spans 8 cols */}
            <div className="lg:col-span-8 flex flex-col gap-10">

                {/* Holographic Farm Map */}
                <div className="min-h-[500px] relative overflow-hidden group neo-glass rounded-[4rem] border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-600/10 opacity-30 transition-all duration-1000 scale-105 group-hover:scale-100" />

                    {/* Laser Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

                    {/* UI overlay */}
                    <div className="relative z-10 p-12 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-3xl">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse" />
                                <span className="text-[10px] font-black font-mono text-blue-100 uppercase tracking-[0.5em]">Deep-Spatial Telemetry</span>
                            </div>
                            <Button size="sm" variant="outline" className="h-11 px-6 !bg-white/5 !border-white/10 !text-white !text-[9px] font-black tracking-[0.2em] uppercase hover:!bg-white/10 rounded-xl">
                                ORBITAL VIEW ⛶
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {diagnostics.map((d, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -8, backgroundColor: "rgba(255,255,255,0.05)" }}
                                    className="p-6 rounded-[2rem] bg-black/30 border border-white/5 backdrop-blur-xl group/stat transition-all"
                                >
                                    <p className="text-[9px] uppercase text-slate-500 tracking-[0.3em] mb-3 group-hover/stat:text-blue-400 transition-colors font-black">{d.label}</p>
                                    <div className="flex items-end gap-2">
                                        <p className={`text-2xl font-black tracking-tighter uppercase italic leading-none ${d.status === 'warning' ? 'text-amber-500' : 'text-white'}`}>
                                            {d.value}
                                        </p>
                                        <div className={`h-1.5 w-1.5 rounded-full mb-1 ${d.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Analytics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="p-10 neo-glass border-white/5 rounded-[3rem] relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Efficiency Core</span>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Yield Prediction</h3>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-black px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 uppercase tracking-widest">+12.4%</span>
                        </div>
                        <div className="h-48 relative">
                            <SimpleAreaChart data={[{ name: 'A', value: 20 }, { name: 'B', value: 45 }, { name: 'C', value: 30 }, { name: 'D', value: 60 }]} color="#10b981" height={190} />
                        </div>
                    </div>
                    <div className="p-10 neo-glass border-white/5 rounded-[3rem] relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Global Node</span>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Market Index</h3>
                            </div>
                            <span className="text-[10px] text-blue-500 font-black px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 animate-pulse uppercase tracking-widest">LIVE FEED</span>
                        </div>
                        <div className="h-48 relative">
                            <SimpleAreaChart data={[{ name: 'M', value: 4000 }, { name: 'T', value: 3000 }, { name: 'W', value: 5000 }, { name: 'T', value: 4500 }]} color="#3b82f6" height={190} />
                        </div>
                    </div>
                </div>

            </div>

            {/* 2. SIDEBAR (Actions/Alerts) - Spans 4 cols */}
            <div className="lg:col-span-4 flex flex-col gap-10">

                {/* AI Assistant Widget */}
                <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-950 border border-white/10 shadow-2xl relative overflow-hidden rounded-[3.5rem] group min-h-[350px] flex flex-col justify-end">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                        <span className="text-9xl">🤖</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic leading-none">Rythu AI Core</h3>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-8">Neural Engine v9.4</p>

                        <div className="space-y-4 mb-10">
                            <div className="p-6 rounded-[2rem] bg-black/35 border border-white/10 text-[11px] text-white/90 font-bold leading-relaxed backdrop-blur-3xl uppercase tracking-wider italic">
                                "Synthesizing atmospheric data... Recommendation: Activate thermal shielding in Sector 4 within 120 minutes."
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <input
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all font-bold tracking-wide uppercase"
                                placeholder="Transmit query..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        simulateResponse(e.target.value);
                                        toggleAI(true);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button
                                onClick={() => toggleAI(true)}
                                className="h-14 w-16 bg-white text-blue-900 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center text-xl"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>

                {/* Command Center Objectives */}
                <div className="flex-1 neo-glass overflow-hidden border-white/5 rounded-[3.5rem] flex flex-col">
                    <div className="p-10 border-b border-white/5 bg-white/5 flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-black text-white tracking-widest uppercase italic">Objectives</h3>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Active Command Queue</span>
                        </div>
                        <span className="text-[10px] px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 font-black border border-blue-500/30 uppercase tracking-widest">3 Priority</span>
                    </div>
                    <div className="divide-y divide-white/5 flex-1">
                        {[
                            { task: "Initialize Nutrient Cycle", time: "Sector 3 • 2h Mark", urgent: true },
                            { task: "Verify Global Trade Flux", time: "Analysis Required", urgent: false },
                            { task: "Authorize Drone Fleet", time: "Logistics Queue", urgent: false },
                        ].map((t, i) => (
                            <div key={i} className="p-10 flex items-center gap-8 hover:bg-white/5 transition-all cursor-pointer group">
                                <div className={`w-2.5 h-2.5 rounded-full ${t.urgent ? 'bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse' : 'bg-slate-700'}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-black text-white group-hover:text-blue-500 transition-colors tracking-widest uppercase italic">{t.task}</p>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">{t.time}</p>
                                </div>
                                <span className="text-slate-700 text-xl group-hover:text-white group-hover:translate-x-2 transition-all">→</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
